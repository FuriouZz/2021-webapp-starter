import { Queue } from "./queue"

export type RunnerTask<T> = {
  name: string
  action: (obj: T) => any | Promise<any>
  group: boolean
}

function NOOP() {}

export class Runner<T=any> {

  tasks = new Map<string, RunnerTask<T>>()
  queues = new Map<string, Queue<string>>()

  group(name: string) {
    if (this.queues.has(name)) {
      return this.queues.get(name)
    }
    const queue = new Queue<string>()
    this.queues.set(name, queue)
    this.tasks.set(name, {
      name,
      action: NOOP,
      group: true
    })
    return queue
  }

  task(name: string, action: RunnerTask<T>['action']) {
    this.tasks.set(name, {
      name,
      action,
      group: false
    })
  }

  async execute(taskName: string, obj: T) {
    return this.executeTask(taskName, obj)
  }

  protected resolveTasks(stack: Queue<string>): Queue<string> {
    let needResolve = false
    const queue = new Queue<string>()
    queue.unresolved = stack.unresolved.slice(0)
    queue.onresolve.once(() => needResolve = true)

    for (const taskName of stack.items) {
      const task = this.tasks.get(taskName)
      if (!task) continue

      if (task.group) {
        const stck = this.resolveTasks(this.queues.get(taskName))
        queue.pushBack(...stck.items)
      } else {
        queue.pushBack(taskName)
      }
    }

    if (needResolve) {
      return this.resolveTasks(queue)
    }

    return queue
  }

  protected async executeSingleTask(taskName: string, obj: T) {
    if (!this.tasks.has(taskName)) return false

    console.log("Execute", taskName)
    const task = this.tasks.get(taskName)
    const ret = task.action(obj)
    if (ret && typeof ret === "object" && typeof ret.then === "function") {
      await ret
    }

    return true
  }

  protected async executeTask(taskName: string, obj: T) {
    if (!this.tasks.has(taskName)) return false

    const task = this.tasks.get(taskName)
    const tasks: string[] = []

    if (task.group) {
      const queue = this.resolveTasks(this.queues.get(task.name))
      queue.items
        .filter(taskName => this.tasks.has(taskName))
        .forEach(taskName => tasks.push(taskName))
    } else {
      tasks.push(task.name)
    }

    for (const name of tasks) {
      await this.executeSingleTask(name, obj)
    }

    return true
    // if (!this.queues.has(stackName)) return false

    // const stack = this.queues.get(stackName)

    // const resolveTasks = (stack: Queue<string>) => {
    //   const queue = new Queue<string>()
    //   queue.unresolved = stack.unresolved.slice(0)

    //   for (const taskName of stack.items) {
    //     const task = this.tasks.get(taskName)
    //     if (!task) continue

    //     if (task.group) {
    //       const stck = resolveTasks(this.queues.get(taskName))
    //       queue.pushBack(...stck.items)
    //     } else {
    //       queue.pushBack(taskName)
    //     }
    //   }

    //   return queue
    // }

    // const queue = resolveTasks(stack)
    // const tasks = queue.items
    //   .filter(taskName => this.tasks.has(taskName))
    //   .map(taskName => this.tasks.get(taskName))

    // for (const task of tasks) {
    //   console.log("Execute", task.name)
    //   const ret = task.action(obj)
    //   if (ret && typeof ret === "object" && typeof ret.then === "function") {
    //     await ret
    //   }
    // }

    // return true
  }

}
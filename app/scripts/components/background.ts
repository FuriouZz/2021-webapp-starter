import { asset_url } from "lib/asset";
import { NC, NCEvent } from "lib/notification-center";
import { Metrics, Timer } from "stores/references";
import { Renderer, Transform, GLTFLoader, Orbit, Vec3, Camera } from "ogl";

export class Suzanne {
  renderer
  scene
  camera
  controls: any;
  composer: any;

  constructor() {
    this.onRender = this.onRender.bind(this)
    this.onResize = this.onResize.bind(this)
    this.init()
  }

  init() {
    this.renderer = new Renderer({
      canvas: document.querySelector<HTMLCanvasElement>('#background canvas')
    })
    this.scene = new Transform()
    this.camera = new Camera()
    this.controls = new Orbit(this.camera, {
      target: new Vec3(0, 0.7, 0),
    });
  }

  async load() {
    const gltf = await GLTFLoader.load(this.renderer.gl, asset_url("models/suzanne.glb"))

    let capsule
    for (const child of gltf.scene) {
      if (/^Suzanne$/.test(child.name)) {
        capsule = child
        this.scene.addChild(child)
      } else if (/^Camera$/.test(child.name)) {
        this.camera.position.copy(child.position)
      }
    }

    this.camera.lookAt(capsule.position)
    this.controls.target.copy(capsule.position)
  }

  enable() {
    NC.on("resize", this.onResize)
    NC.on("raf", this.onRender)
    this.onResize({ event: "resize", value: Metrics })
  }

  disable() {
    NC.off("resize", this.onResize)
    NC.off("raf", this.onRender)
  }

  onResize(e: NCEvent<"resize">) {
    this.renderer.setSize(e.value.width, e.value.height);
    this.camera.perspective({ aspect: e.value.width / e.value.height });
  }

  onRender(e: NCEvent<"resize">) {
    this.controls.update()
    this.renderer.render({ scene: this.scene, camera: this.camera })
  }

}
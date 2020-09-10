declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.css' {
  const value: any;
  export default value;
}

declare module '*.styl' {
  const value: any;
  export default value;
}

declare module '*.html' {
  const value: string;
  export default value;
}

declare module '*.html.ejs' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}
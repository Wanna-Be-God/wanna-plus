import { makeInstaller } from "@wanna-plus/utils";
import components from "./components";

const installer = makeInstaller(components);

export * from "@wanna-plus/components";
export default installer;

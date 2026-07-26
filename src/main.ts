import { AppShell, assertRegistryReady } from './app/AppShell';

const root = document.querySelector<HTMLElement>('#app');
if (!root) {
  throw new Error('#app root missing');
}

assertRegistryReady();
const shell = new AppShell(root);
shell.start();

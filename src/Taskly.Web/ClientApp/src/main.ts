import './styles.scss';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { installNamespacedStorage } from './app/core/utilities/namespaced-storage.utility';

// Keep every key this demo writes under one prefix, so it stays in its own contained group in the
// visitor's browser storage rather than scattering loose entries across their device.
installNamespacedStorage('taskly-demo:');

bootstrapApplication(App, appConfig)
  .catch((err: unknown) => console.error(err));

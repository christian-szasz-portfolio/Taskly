import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
import { renderApplication } from '@angular/platform-server';

/**
 * Bootstrap function for AnalogJS/Nitro SSR.
 * This is called by the Nitro server to render the Angular app.
 */
export default async function render(url: string, document: string): Promise<string> {
  const html = await renderApplication(
    () => bootstrapApplication(App, config),
    {
      document,
      url,
    }
  );
  return html;
}

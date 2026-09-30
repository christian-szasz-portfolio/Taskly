import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons, type IconDefinition } from '../../../core/icons/icon-registry';

/**
 * The attachments section of an editable task or subtask. The demo stores no files, so it shows
 * the upload button disabled, with the reason, rather than a list that would always be empty.
 */
@Component({
  selector: 'app-file-attachment-list',
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule, FontAwesomeModule],
  templateUrl: './file-attachment-list.component.html',
  styleUrl: './file-attachment-list.component.scss',
  host: {
    '[style.display]': 'editable() ? null : "none"'
  }
})
export class FileAttachmentListComponent {
  /** Shown only while editing: there is nothing to list when reading */
  public readonly editable = input(false);

  public readonly title = input('Attachments');

  public readonly showSectionHeader = input(false);

  public readonly headerIcon = input<IconDefinition>(Icons.attachment);

  public readonly uploadIcon = Icons.upload;

  public readonly uploadDisabledNote = 'The demo does not allow uploading files.';
}

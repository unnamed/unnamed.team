import { useToasts } from "@/components/toast";
import { writeEmojis } from "@/lib/glyphs/mcemoji";
import { uploadTemporaryFile } from "@/lib/artemis";
import * as Files from "@/lib/files";
import Header from "@/components/layout/Header";
import Link from "next/link";
import Button from "@/components/Button";
import { useGlyphEditorContext } from "@/context/GlyphEditorContext";

export default function GlyphEditorHeader() {
  const [ data ] = useGlyphEditorContext();
  const toasts = useToasts();

  function upload() {
    if (data.glyphMap.byName.size < 1) {
      toasts.add('error', 'No emojis to upload, add some emojis first!');
      return;
    }
    writeEmojis(data.glyphMap.byName)
      .then(uploadTemporaryFile)
      .then(response => {
        if (response.ok) {
          response.json().then(json => {
            const { id } = json;
            const command = `/emojis update ${id}`;

            navigator.clipboard.writeText(command).catch(console.error);

            toasts.add(
              'success',
              'Successfully uploaded emojis, execute the'
              + ` command (${command}) in your Minecraft server to load them.`,
            );
          });
        } else {
          const errorMessages: {
            [ code: number ]: string
          } = {
            413: 'Your emoji pack is too large to be received by our backend,'
              + ' try reducing its size or manually downloading it and uploading to'
              + ' your Minecraft server (plugins/unemojis/emojis.mcemoji)',
          };

          toasts.add('error', errorMessages[response.status] || `HTTP Status ${response.status}`);
        }
      });
  }

  function download() {
    if (data.glyphMap.byName.size < 1) {
      // no emojis, return
      toasts.add('error', 'No emojis to save, add some glyphs first!');
      return;
    }
    writeEmojis(data.glyphMap.byName)
      .then(blob => Files.saveFile(blob, 'emojis.mcemoji'));
  }

  return (
    <Header banner={(<span>
        Important! Update to <span className="font-bold"> 1.4.0+</span> if you want to
        have more than 256 emojis. Report any issue on our <Link href="/discord"><span
        className="underline cursor-pointer">Discord server</span></Link>
    </span>)}>
      <div className="flex flex-row md:w-full md:px-16 justify-start gap-2">
        <Button
          label="Download"
          title="Download the glyphs as an MCEMOJI file"
          color="primaryGhost"
          size="small"
          onClick={download}
        />
        <Button
          label="Upload"
          title="Upload the glyphs to then load them on your Minecraft server"
          color="primaryGhost"
          size="small"
          onClick={upload}
        />
      </div>
    </Header>
  );
}
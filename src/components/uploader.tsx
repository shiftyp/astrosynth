import * as React from "react";
import { useRef, useCallback, SyntheticEvent } from "react";
import carinaURL from "../images/carina_webb.png";

export const Uploader = ({ onImage }: { onImage: (url: string) => void }) => {
  const input = useRef<HTMLInputElement>(null);
  const select = useRef<HTMLSelectElement>(null);

  const submit = useCallback(
    (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
      const reader = new FileReader();

      const file = input.current!.files![0];
      const option = select.current!.value;

      if (file) {
        reader.onload = () => {
          onImage(
            URL.createObjectURL(new Blob([reader.result as ArrayBuffer]))
          );
        };

        reader.readAsArrayBuffer(file);
      } else if (option) {
        fetch(option)
          .then((resp) => resp.blob())
          .then((blob) => URL.createObjectURL(blob as Blob))
          .then((url) => onImage(url));
      }
      event.preventDefault();
    },
    [onImage]
  );

  return (
    <form onSubmit={submit}>
      <label>
        Upload an Image
        <input type="file" ref={input} />
      </label>
      <span>Or</span>
      <label>
        Select an Image
        <select ref={select}>
          <option value={carinaURL}>Carina Nebula</option>
        </select>
      </label>
      <button type="submit">Open Image</button>
    </form>
  );
};

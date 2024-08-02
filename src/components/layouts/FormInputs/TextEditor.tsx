/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/components/ui/label";
import {
  ContentState,
  Editor,
  EditorState,
  // RawDraftContentState,
  RichUtils,
  convertToRaw,
  ContentBlock,
  CompositeDecorator,
  convertFromHTML,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { useRef, useState } from "react";
import {
  Superscript,
  BoldIcon,
  UnderlineIcon,
  Subscript,
  ItalicIcon,
  Link2Icon,
} from "lucide-react";
import { RegisterOptions } from "react-hook-form";
import {
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
} from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import draftToHtml from "draftjs-to-html";
import DOMPurify from "dompurify";
import juice from "juice";

const Link = (props: any): any => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url} className="text-primary cursor-pointer">
      {props.children}
    </a>
  );
};

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
]);

type TextEditorProps = {
  label?: string | JSX.Element;
  containerClass?: string;
  error?: string;
  onChange?: RegisterOptions["onChange"];
  value?: RegisterOptions["value"];
};

export const TextEditor = (props: TextEditorProps) => {
  const editorRef = useRef<Editor>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState<string | null>("%link%");

  const blocksFromHTML = convertFromHTML(props.value ?? "");
  const state = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  );

  const [editorState, setEditorState] = useState(
    props.value
      ? EditorState.createWithContent(state)
      : EditorState.createEmpty(decorator)
  );
  const [textAlign, setTextAlign] = useState<"right" | "center" | "left">(
    "left"
  );

  // const convertToString = (content: RawDraftContentState) => {
  //   let plaintext = "";

  //   const contentState = content.blocks?.filter((item) => item.text !== " ");

  //   const allContent: { type: string; text: string; index: number }[] = [];

  //   contentState.forEach((block, index) => {
  //     allContent.push({ type: "block", text: block.text, index });
  //   });

  //   plaintext = allContent.map((item) => item.text).join(" ");

  //   return plaintext;
  // };

  const onChange = (editorState: EditorState) => {
    // logState()
    if (!props.onChange) {
      setEditorState(editorState);
      return;
    }

    setEditorState(editorState);

    const currentContentState = editorState.getCurrentContent();

    const rawContentState = convertToRaw(currentContentState);

    const rawHtml = draftToHtml(rawContentState);
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    const inlineStyledHtml = juice(cleanHtml);

    props.onChange(inlineStyledHtml);
  };

  function handleKeyCommand(command: string, editorState: EditorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      props?.onChange?.(newState);
      return "handled";
    }

    return "not-handled";
  }

  function _onFocus() {
    editorRef.current?.focus();
  }

  // const logState = () => {
  //   const content = editorState.getCurrentContent();
  //   console.log(convertToRaw(content));
  // };

  function _toggleInlineStyle(inlineStyle: string, e: any) {
    if (inlineStyle.includes("text")) {
      const textAlign: Record<string, "left" | "right" | "center"> = {
        "text-left": "left",
        "text-right": "right",
        "text-center": "center",
      };
      setTextAlign(textAlign[inlineStyle as keyof typeof textAlign]);
      return;
    }

    if (inlineStyle.includes("link")) {
      // promptForLink(e);
      confirmLink(e);
      return;
    }

    const state = RichUtils.toggleInlineStyle(editorState, inlineStyle);

    setEditorState(state);
    onChange(state);
  }

  // const promptForLink = (e: any) => {
  //   e.preventDefault();
  //   const selection = editorState.getSelection();
  //   if (!selection.isCollapsed()) {
  //     const contentState = editorState.getCurrentContent();
  //     const startKey = editorState.getSelection().getStartKey();
  //     const startOffset = editorState.getSelection().getStartOffset();
  //     const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
  //     const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);

  //     let urlValue = "";
  //     if (linkKey) {
  //       const linkInstance = contentState.getEntity(linkKey);
  //       urlValue = linkInstance.getData().url;
  //     }

  //     setShowInput(true);
  //     setUrl(urlValue);

  //     setTimeout(() => inputRef.current?.focus(), 0);
  //   }
  // };

  const confirmLink = (e: any) => {
    e.preventDefault();
    const contentState = editorState.getCurrentContent();

    const contentStateWithEntity = contentState.createEntity(
      "LINK",
      "MUTABLE",
      { url }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    // Apply entity
    let nextEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });

    // Apply selection
    nextEditorState = RichUtils.toggleLink(
      nextEditorState,
      nextEditorState.getSelection(),
      entityKey
    );

    onChange(nextEditorState);
    setShowInput(false);
    setUrl(null);
    setTimeout(() => _onFocus(), 0);
  };

  const onLinkInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      confirmLink(e as any);
    }
  };

  // const removeLink = (e: any) => {
  //   e.preventDefault();
  //   const selection = editorState.getSelection();
  //   if (!selection.isCollapsed()) {
  //     this.setState({
  //       editorState: RichUtils.toggleLink(editorState, selection, null),
  //     });
  //   }
  // };

  let urlInput;
  if (showInput) {
    urlInput = (
      <div className="mt-6 mb-2 absolute -top-8 left-5 ">
        <Input
          onChange={(e) => setUrl(e.target.value)}
          ref={inputRef}
          type="text"
          className="w-60 mr-2 inline-block bg-white"
          placeholder="Enter the link url"
          value={url ?? ""}
          onKeyDown={onLinkInputKeyDown}
        />
        <Button onMouseDown={confirmLink}> Confirm </Button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col font-medium w-full relative ${
        props.containerClass ?? ""
      }`}
    >
      {urlInput}
      <Label className="flex flex-col justify-center text-sm whitespace-nowrap text-stone-900">
        {props.label}
      </Label>

      <div className="bg-white border border-b-0 border-stone-300 px-3 rounded-t-lg flex py-1.5 mt-2 gap-5 items-center">
        <InlineStyleControls
          editorState={editorState}
          onToggle={_toggleInlineStyle}
        />
      </div>
      <div
        onClick={_onFocus}
        className="h-60 w-full rounded-b-lg border border-t-0 border-solid border-stone-300 px-6 gap-1 cursor-text text-gray-500 overflow-auto"
      >
        <Editor
          ref={editorRef}
          onChange={onChange}
          textAlignment={textAlign}
          editorState={editorState}
          placeholder="write you message"
          handleKeyCommand={handleKeyCommand}
        />
      </div>
      <span className="text-xs text-red-500 mt-1">{props.error}</span>
    </div>
  );
};

const INLINE_STYLES = [
  {
    label: "Bold",
    style: "BOLD",
    component: <BoldIcon className="h-3 w-3 cursor-pointer" />,
  },
  {
    label: "Italic",
    style: "ITALIC",
    component: <ItalicIcon className="h-3 w-3 cursor-pointer" />,
  },
  {
    label: "Underline",
    style: "UNDERLINE",
    component: <UnderlineIcon className="h-3 w-3 cursor-pointer" />,
  },
  {
    label: "Superscript",
    style: "SUPERSCRIPT",
    component: <Superscript className="h-3 w-3 cursor-pointer" />,
  },
  {
    label: "Subscript",
    style: "SUBSCRIPT",
    component: <Subscript className="h-3 w-3 cursor-pointer" />,
  },
  {
    label: "text-left",
    style: "text-left",
    component: <TextAlignLeftIcon className="h-3 w-3 cursor-pointer" />,
  },
  {
    label: "text-center",
    style: "text-center",
    component: <TextAlignCenterIcon className="h-3 w-3 cursor-pointer" />,
  },
  {
    label: "text-right",
    style: "text-right",
    component: <TextAlignRightIcon className="h-3 w-3 cursor-pointer" />,
  },
  {
    label: "link",
    style: "link",
    component: <Link2Icon className="h-3 w-3 cursor-pointer" />,
  },
];

type StyleButton = {
  onToggle: (value: any, e: any) => void;
  style: string;
  active: boolean;
  label: string;
  component: any;
};

const StyleButton = (props: StyleButton) => {
  const onToggle = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    props.onToggle(props.style, e);
  };

  let className = "RichEditor-styleButton";
  if (props.active) {
    className += " text-primary font-bold";
  }

  return (
    <div className={`${className}`} onMouseDown={onToggle}>
      {props.component}
    </div>
  );
};

type InlineStyleProps = {
  editorState: EditorState;
  onToggle: (value: any, e: any) => void;
};

const InlineStyleControls = (props: InlineStyleProps) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();

  return (
    <div className="px-3 rounded-b-lg flex py-1.5 gap-5 items-center justify-end">
      {INLINE_STYLES.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
          component={type.component}
        />
      ))}
    </div>
  );
};

type CallbackFn = (start: number, end: number) => void;

function findLinkEntities(
  contentBlock: ContentBlock,
  callback: CallbackFn,
  contentState: ContentState
) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
}

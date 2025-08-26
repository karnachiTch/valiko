import React, { useRef } from 'react';

const toolbar = [
  { cmd: 'bold', icon: 'B' },
  { cmd: 'italic', icon: 'I' },
  { cmd: 'underline', icon: 'U' },
];

const ProductDescriptionFormatter = ({ description }) => {
  const ref = useRef();

  const handleFormat = (cmd) => {
    document.execCommand(cmd, false, null);
    ref.current && ref.current.focus();
  };

  return (
    <div>
      <div className="flex space-x-2 mb-2">
        {toolbar.map((t) => (
          <button
            key={t.cmd}
            type="button"
            className="px-2 py-1 border border-border rounded text-xs font-bold hover:bg-muted"
            onMouseDown={e => e.preventDefault()}
            onClick={() => handleFormat(t.cmd)}
          >
            {t.icon}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="min-h-[48px] p-2 border border-border rounded bg-muted/30 text-foreground focus:outline-primary"
        contentEditable
        suppressContentEditableWarning
        spellCheck={true}
        style={{ whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: description?.replace(/\n/g, '<br/>') || '' }}
      />
    </div>
  );
};

export default ProductDescriptionFormatter;
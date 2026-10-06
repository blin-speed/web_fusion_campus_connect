export default function Modal({ isOpen, onClose, children }) { if (!isOpen) return null; return <div className='ui-modal'><button onClick={onClose}>Close</button>{children}</div>; }

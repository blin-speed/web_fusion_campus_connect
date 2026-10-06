New-Item -Path "src\hooks" -ItemType Directory -Force
New-Item -Path "src\lib" -ItemType Directory -Force
New-Item -Path "src\components\ui" -ItemType Directory -Force
New-Item -Path "src\components\domain" -ItemType Directory -Force

Set-Content -Path "src\hooks\useResource.js" -Value "export function useResource() { return {}; }"
Set-Content -Path "src\lib\format.js" -Value "export function formatCurrency(val) { return `$${val}`; } export function formatDate(val) { return new Date(val).toLocaleDateString(); }"

Set-Content -Path "src\components\ui\Button.jsx" -Value "export default function Button({ children, ...props }) { return <button {...props} className='ui-button'>{children}</button>; }"
Set-Content -Path "src\components\ui\Modal.jsx" -Value "export default function Modal({ isOpen, onClose, children }) { if (!isOpen) return null; return <div className='ui-modal'><button onClick={onClose}>Close</button>{children}</div>; }"
Set-Content -Path "src\components\ui\Toast.jsx" -Value "export default function Toast({ message }) { return <div className='ui-toast'>{message}</div>; }"

Set-Content -Path "src\components\domain\PhotoUploaderV2.jsx" -Value "export default function PhotoUploaderV2() { return <div>Photo Uploader v2</div>; }"
Set-Content -Path "src\components\RequireUser.jsx" -Value "import { Navigate } from 'react-router'; export default function RequireUser({ children, user }) { return user ? children : <Navigate to='/' />; }"


import { Button } from './button'
interface ModalProps {
  message?: string
  onClose: () => void
  error?: boolean
}

export const Modal: React.FC<ModalProps> = ({ message, onClose, error }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="w-2/3 bg-white rounded shadow-lg p-4 relative">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">
            {error === true ? 'Error' : ''}
          </h2>
          <p>{message}</p>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onClose} variant="destructive" className="px-4 py-2">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

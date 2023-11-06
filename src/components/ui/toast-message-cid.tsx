interface ToastContentProps {
  amount: string
  client: string
  messageCID: string
}

export const ToastContent: React.FC<ToastContentProps> = ({
  amount,
  client,
  messageCID,
}) => (
  <>
    Datacap allocation of {amount} for {client} has been sent with message CID
    <a
      href={`https://filfox.info/en/message/${messageCID}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {messageCID}
    </a>
  </>
)

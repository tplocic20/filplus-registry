import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import React from 'react'

interface AccountSelectionDialogProps {
  open: boolean
  accounts: string[]
  onClose: () => void
  onSelect: (value: number) => void
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(42, 105, 237, 0.08) !important',
  },
}))

const AccountSelectionDialog: React.FC<AccountSelectionDialogProps> = ({
  open,
  accounts,
  onClose,
  onSelect,
}) => {
  const handleListItemClick = (value: number): void => {
    onSelect(value)
    onClose()
  }

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle className="cursor-default">Select an Account</DialogTitle>
      <DialogContent dividers>
        <Table>
          <TableBody>
            {accounts.map((account, index) => (
              <StyledTableRow
                key={account}
                hover
                onClick={() => {
                  handleListItemClick(index)
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  className="cursor-pointer"
                >
                  {account}
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AccountSelectionDialog

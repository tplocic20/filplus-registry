import React, { useState } from 'react'
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
import { Skeleton } from '@mui/material'

interface AccountSelectionDialogProps {
  open: boolean
  accounts: string[]
  onClose: () => void
  onLoadMore: () => Promise<void>
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
  onLoadMore,
  onSelect,
}) => {
  const [loading, setLoading] = useState(false)

  const handleLoadMore = (): void => {
    setLoading(true)
    onLoadMore().finally(() => {
      // Maneja la promesa dentro de la función
      setLoading(false)
    })
  }

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

            {loading &&
              [...new Array(5)].map((_, index) => (
                <StyledTableRow key={index}>
                  <TableCell>
                    <Skeleton variant="text" width="100%" />
                  </TableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'space-between' }}>
        <Button onClick={handleLoadMore}>Load more</Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AccountSelectionDialog

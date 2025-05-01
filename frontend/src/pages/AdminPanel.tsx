import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit, Close } from "@mui/icons-material";
import { RootState } from "../store";
import { updateCredits } from "../store/slices/authSlice";

interface EditDialogProps {
  open: boolean;
  user: any;
  onClose: () => void;
  onSave: (userId: string, credits: number) => void;
}

const EditDialog: React.FC<EditDialogProps> = ({
  open,
  user,
  onClose,
  onSave,
}) => {
  const [credits, setCredits] = useState(user?.credits || 0);

  const handleSave = () => {
    onSave(user._id, credits);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Edit User Credits
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Username: {user?.username}
          </Typography>
          <TextField
            fullWidth
            label="Credits"
            type="number"
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { users } = useSelector((state: RootState) => state.users);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  useEffect(() => {
    dispatch(getAllUsers()); // TODO: Import getAllUsers from users slice
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredUsers = users?.filter(
    (user: any) =>
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
  );

  const handleUpdateCredits = (userId: string, credits: number) => {
    dispatch(updateUserCredits({ userId, credits }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          User Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Search users"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Credits</TableCell>
                <TableCell>Profile Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers?.map((user: any) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.credits}</TableCell>
                  <TableCell>
                    {user.profileCompleted ? "Complete" : "Incomplete"}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => setEditUser(user)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <EditDialog
          open={Boolean(editUser)}
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={handleUpdateCredits}
        />
      </Paper>
    </Container>
  );
};

export default AdminPanel;

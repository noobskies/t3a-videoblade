"use client";

import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { organization } from "@/lib/auth-client";
import { useState } from "react";

export function MembersPageClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: members } = (organization as any).useListMembers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activeOrg } = (organization as any).useActiveOrganization();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const handleInvite = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (organization as any).inviteMember({
      email,
      role,
    });
    setIsInviteOpen(false);
    setEmail("");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRemove = async (memberId: string) => {
    if (confirm("Are you sure?")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (organization as any).removeMember({
        memberId,
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Team Members
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage access to <strong>{activeOrg?.name}</strong>
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsInviteOpen(true)}
        >
          Invite Member
        </Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {members?.map((member: any) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={member.user.image} alt={member.user.name} />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {member.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.user.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell sx={{ textTransform: "capitalize" }}>
                  {member.role}
                </TableCell>
                <TableCell>
                  {new Date(member.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleRemove(member.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!members || members.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No members found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isInviteOpen} onClose={() => setIsInviteOpen(false)}>
        <DialogTitle>Invite Member</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1, minWidth: 300 }}>
            <TextField
              label="Email Address"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* Role select could go here */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsInviteOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite}>
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

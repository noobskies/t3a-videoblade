"use client";

import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button, Avatar, Stack } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

export function AuthButton() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Button disabled variant="outlined" sx={{ borderRadius: 20, px: 4 }}>
        Loading...
      </Button>
    );
  }

  if (session) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        {session.user?.image && (
          <Avatar
            src={session.user.image}
            alt={session.user.name || "User"}
            sx={{ width: 32, height: 32 }}
          />
        )}
        <Button
          onClick={() => signOut()}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: 20, px: 4 }}
        >
          Sign out
        </Button>
      </Stack>
    );
  }

  return (
    <Button
      onClick={() =>
        signIn.social({
          provider: "google",
          callbackURL: "/",
        })
      }
      variant="contained"
      startIcon={<GoogleIcon />}
      sx={{ borderRadius: 20, px: 4 }}
    >
      Sign in with Google
    </Button>
  );
}

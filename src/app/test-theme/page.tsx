"use client";

import { Box, Button, Typography, useTheme } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";

export default function TestThemePage() {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        MUI Theme Test
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Current mode: {mode}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={() => setMode("light")}>
          Light Mode
        </Button>
        <Button variant="contained" onClick={() => setMode("dark")}>
          Dark Mode
        </Button>
        <Button variant="contained" onClick={() => setMode("system")}>
          System Mode
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <Button variant="contained" color="primary">
          Primary
        </Button>
        <Button variant="contained" color="secondary">
          Secondary
        </Button>
        <Button variant="contained" color="error">
          Error
        </Button>
        <Button variant="outlined" color="primary">
          Outlined
        </Button>
        <Button variant="text" color="primary">
          Text
        </Button>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
        <Typography variant="body2">
          Background: {theme.palette.background.default}
        </Typography>
        <Typography variant="body2">
          Text: {theme.palette.text.primary}
        </Typography>
        <Typography variant="body2">
          Primary: {theme.palette.primary.main}
        </Typography>
      </Box>
    </Box>
  );
}

"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

interface ScheduleSettingsPageProps {
  platformConnectionId: string;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Common timezones
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function ScheduleSettingsPage({
  platformConnectionId,
}: ScheduleSettingsPageProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const [timezone, setTimezone] = useState("UTC");
  // State: day index -> array of time strings
  const [slots, setSlots] = useState<Record<number, string[]>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Fetch existing settings
  const { data: settings, isLoading } = api.schedule.getSettings.useQuery(
    { platformConnectionId },
    {
      refetchOnWindowFocus: false,
    },
  );

  // Update mutation
  const updateMutation = api.schedule.updateSettings.useMutation({
    onSuccess: () => {
      setIsDirty(false);
      utils.schedule.getSettings.invalidate({ platformConnectionId });
      alert("Schedule saved successfully!");
    },
    onError: (err) => {
      alert(`Failed to save: ${err.message}`);
    },
  });

  // Initialize state from data
  useEffect(() => {
    if (settings) {
      setTimezone(
        settings.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          "UTC",
      );

      // Parse slots JSON
      const parsedSlots: Record<number, string[]> = {};
      // Initialize all days with empty arrays
      for (let i = 0; i <= 6; i++) parsedSlots[i] = [];

      if (Array.isArray(settings.slots)) {
        (settings.slots as { day: number; times: string[] }[]).forEach((s) => {
          parsedSlots[s.day] = [...s.times];
        });
      }
      setSlots(parsedSlots);
    } else if (!isLoading && !settings) {
      // Initialize defaults if no settings found (but connected)
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
      const parsedSlots: Record<number, string[]> = {};
      for (let i = 0; i <= 6; i++) parsedSlots[i] = [];
      setSlots(parsedSlots);
    }
  }, [settings, isLoading]);

  const handleAddTime = (day: number) => {
    const newTime = "09:00"; // Default time
    setSlots((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), newTime].sort(),
    }));
    setIsDirty(true);
  };

  const handleRemoveTime = (day: number, index: number) => {
    setSlots((prev) => ({
      ...prev,
      [day]: prev[day]?.filter((_, i) => i !== index) || [],
    }));
    setIsDirty(true);
  };

  const handleTimeChange = (day: number, index: number, value: string) => {
    setSlots((prev) => {
      const newTimes = [...(prev[day] || [])];
      newTimes[index] = value;
      return {
        ...prev,
        [day]: newTimes.sort(),
      };
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    const slotsArray = Object.entries(slots).map(([day, times]) => ({
      day: parseInt(day),
      times,
    }));

    updateMutation.mutate({
      platformConnectionId,
      timezone,
      slots: slotsArray,
    });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Posting Schedule</Typography>
      </Stack>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Timezone</InputLabel>
          <Select
            value={timezone}
            label="Timezone"
            onChange={(e) => {
              setTimezone(e.target.value);
              setIsDirty(true);
            }}
          >
            {TIMEZONES.map((tz) => (
              <MenuItem key={tz} value={tz}>
                {tz}
              </MenuItem>
            ))}
            {/* Add current detected timezone if not in list */}
            {!TIMEZONES.includes(timezone) && (
              <MenuItem value={timezone}>{timezone}</MenuItem>
            )}
          </Select>
        </FormControl>
      </Paper>

      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Weekly Schedule
      </Typography>

      <Stack spacing={2}>
        {DAYS.map((dayName, index) => (
          <Card key={dayName} variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {dayName}
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => handleAddTime(index)}
                >
                  Add Time
                </Button>
              </Stack>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {slots[index]?.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No posting times
                  </Typography>
                )}
                {slots[index]?.map((time, timeIndex) => (
                  <Chip
                    key={timeIndex}
                    label={
                      <input
                        type="time"
                        value={time}
                        onChange={(e) =>
                          handleTimeChange(index, timeIndex, e.target.value)
                        }
                        style={{
                          border: "none",
                          background: "transparent",
                          fontFamily: "inherit",
                          fontSize: "inherit",
                          color: "inherit",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      />
                    }
                    onDelete={() => handleRemoveTime(index, timeIndex)}
                    deleteIcon={<DeleteIcon />}
                    sx={{ pl: 1 }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {isDirty && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            zIndex: 1000,
          }}
        >
          <Typography>You have unsaved changes</Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </Paper>
      )}
    </Box>
  );
}

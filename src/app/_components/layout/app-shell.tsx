"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  VideoLibrary as LibraryIcon,
  CloudUpload as UploadIcon,
  SettingsInputComponent as PlatformsIcon,
  Logout as LogoutIcon,
  CalendarMonth as CalendarMonthIcon,
  Lightbulb as IdeaIcon,
  Inbox as InboxIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Add as AddIcon,
  Movie as VideoIcon,
} from "@mui/icons-material";
import { useSession, signOut } from "@/lib/auth-client";
import { AuthButton } from "@/app/_components/auth-button";
import { api } from "@/trpc/react";
import { Platform } from "../../../../generated/prisma";

const drawerWidth = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Inbox", path: "/inbox", icon: <InboxIcon /> },
  { label: "Ideas", path: "/ideas", icon: <IdeaIcon /> },
  { label: "Library", path: "/library", icon: <LibraryIcon /> },
  { label: "Upload", path: "/upload", icon: <UploadIcon /> },
  { label: "Calendar", path: "/calendar", icon: <CalendarMonthIcon /> },
  { label: "Platforms", path: "/platforms", icon: <PlatformsIcon /> },
];

const SUPPORTED_PLATFORMS = [
  { id: Platform.YOUTUBE, label: "YouTube" },
  { id: Platform.LINKEDIN, label: "LinkedIn" },
  // { id: Platform.TIKTOK, label: "TikTok" },
  // { id: Platform.VIMEO, label: "Vimeo" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const pathname = usePathname();

  const { data: session, isPending } = useSession();
  const { data: platforms } = api.platform.list.useQuery(undefined, {
    enabled: !!session,
  });

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  const getPlatformIcon = (platform: Platform, isConnected = true) => {
    const colorProps = isConnected
      ? {}
      : { color: "disabled" as const, sx: { opacity: 0.7 } };

    switch (platform) {
      case Platform.YOUTUBE:
        return (
          <YouTubeIcon
            sx={isConnected ? { color: "#FF0000" } : { opacity: 0.7 }}
            color={isConnected ? undefined : "disabled"}
          />
        );
      case Platform.LINKEDIN:
        return (
          <LinkedInIcon
            sx={isConnected ? { color: "#0077B5" } : { opacity: 0.7 }}
            color={isConnected ? undefined : "disabled"}
          />
        );
      case Platform.TIKTOK:
        return (
          <VideoIcon
            sx={isConnected ? { color: "#000000" } : { opacity: 0.7 }}
            color={isConnected ? undefined : "disabled"}
          />
        );
      case Platform.VIMEO:
        return (
          <VideoIcon
            sx={isConnected ? { color: "#1AB7EA" } : { opacity: 0.7 }}
            color={isConnected ? undefined : "disabled"}
          />
        );
      default:
        return <VideoIcon {...colorProps} />;
    }
  };

  // Drawer content (Sidebar)
  const drawerContent = (
    <div>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: "bold" }}
        >
          VideoBlade
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={isActive}
                onClick={() => isMobile && handleDrawerClose()}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "inherit" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {session && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box px={2} py={1}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="bold"
              textTransform="uppercase"
            >
              Channels
            </Typography>
          </Box>
          <List>
            {platforms?.map((platform) => {
              const isActive = pathname.startsWith(`/platforms/${platform.id}`);
              return (
                <ListItem key={platform.id} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={`/platforms/${platform.id}`}
                    selected={isActive}
                    onClick={() => isMobile && handleDrawerClose()}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                        "& .MuiListItemIcon-root": {
                          color: "primary.contrastText",
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "inherit" : "text.secondary",
                        minWidth: 40,
                      }}
                    >
                      {getPlatformIcon(platform.platform)}
                    </ListItemIcon>
                    <ListItemText
                      primary={platform.platformUsername ?? platform.platform}
                      primaryTypographyProps={{
                        noWrap: true,
                        fontSize: "0.9rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {SUPPORTED_PLATFORMS.filter(
              (sp) => !platforms?.some((p) => p.platform === sp.id),
            ).map((sp) => (
              <ListItem key={sp.id} disablePadding>
                <ListItemButton
                  component={Link}
                  href="/platforms"
                  onClick={() => isMobile && handleDrawerClose()}
                  sx={{ opacity: 0.7 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getPlatformIcon(sp.id, false)}
                  </ListItemIcon>
                  <ListItemText
                    primary={`Connect ${sp.label}`}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      color: "text.secondary",
                    }}
                  />
                  <AddIcon fontSize="small" color="action" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </div>
  );

  // Loading State (only on initial load when session is undefined)
  if (isPending && session === undefined) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CssBaseline />
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6">VideoBlade</Typography>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width={200} height={40} />
        </Stack>
      </Box>
    );
  }

  // Unauthenticated State (Public Header + Content)
  if (!session) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: "none",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              href="/"
              sx={{
                flexGrow: 1,
                textDecoration: "none",
                color: "inherit",
                fontWeight: "bold",
              }}
            >
              VideoBlade
            </Typography>
            <AuthButton />
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, mt: 8 }}>
          {children}
        </Box>
      </Box>
    );
  }

  // Authenticated State (Sidebar + Dashboard Layout)
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Authenticated AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          {/* User Menu */}
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar
              src={session.user?.image ?? undefined}
              alt={session.user?.name ?? "User"}
            />
          </IconButton>
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {session.user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
        }}
      >
        <Toolbar /> {/* Placeholder for fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
}

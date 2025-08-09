import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Add, Preview, List } from "@mui/icons-material";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: "/create", label: "Create Form", icon: <Add /> },
    { path: "/preview", label: "Preview", icon: <Preview /> },
    { path: "/myforms", label: "My Forms", icon: <List /> },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            <a href="/"> Form Builder</a>
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
                variant={location.pathname === item.path ? "outlined" : "text"}
                sx={{
                  borderColor:
                    location.pathname === item.path ? "white" : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}

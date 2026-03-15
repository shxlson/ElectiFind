import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopBar } from "./index.jsx";

describe("TopBar", () => {
  it("opens profile menu and fires logout", () => {
    const onLogout = vi.fn();

    render(
      <TopBar
        title="Dashboard"
        setPage={() => {}}
        onLogout={onLogout}
      />
    );

    fireEvent.click(screen.getByText("SN"));
    fireEvent.click(screen.getByText("Logout"));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("renders mobile menu button when enabled", () => {
    render(
      <TopBar
        title="Dashboard"
        setPage={() => {}}
        showMenuButton
        onToggleMenu={() => {}}
      />
    );

    expect(screen.getByText("☰")).toBeInTheDocument();
  });
});

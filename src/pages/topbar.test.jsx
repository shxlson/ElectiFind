import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopBar } from "./index.jsx";

describe("TopBar", () => {
  it("fires search change callback", () => {
    const onSearchChange = vi.fn();

    render(
      <TopBar
        title="Dashboard"
        setPage={() => {}}
        searchValue=""
        onSearchChange={onSearchChange}
      />
    );

    const input = screen.getByPlaceholderText("Search courses...");
    fireEvent.change(input, { target: { value: "cloud" } });

    expect(onSearchChange).toHaveBeenCalledWith("cloud");
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

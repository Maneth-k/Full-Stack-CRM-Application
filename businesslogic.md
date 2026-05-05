# CRM Application: Business Logic & Product Requirements

## Overview
We are building a Full-Stack CRM (Customer Relationship Management) system for a small sales team. The goal is to track leads, manage the sales pipeline, and provide actionable metrics. 

## 1. Authentication Flow (Cookie-Based)
*   **Concept:** The app uses a secure, `httpOnly` cookie-based JWT authentication system.
*   **Login Flow:** 
    *   User submits credentials (email/password).
    *   Server validates credentials and generates a JWT.
    *   Server attaches the JWT to an `httpOnly`, `secure`, `SameSite=Strict` cookie in the response.
    *   Frontend relies on HTTP status codes (401/403) to know if the user is authenticated, rather than reading the token directly.
*   **Seed Data:** The system must automatically seed an admin user on startup: `admin@example.com` / `password123`.

## 2. Core Entities & Business Rules
*   **User:** Represents a salesperson. They can log in and be assigned leads.
*   **Lead:** A potential customer. 
    *   *Lifecycle:* Must follow strict status stages: `New` -> `Contacted` -> `Qualified` -> `Proposal Sent` -> `Won` or `Lost`.
    *   *Rules:* A lead must have an estimated deal value. It tracks who it is assigned to.
*   **Note:** Internal updates on a lead. 
    *   *Rules:* Whenever a note is added, the system should ideally update the Lead's `updatedAt` or a specific `lastContacted` timestamp.

## 3. Dashboard Metrics (Analytics)
The dashboard must aggregate data from the database to show:
*   Total number of leads in the system.
*   Count of leads segmented by Status (New, Qualified, Won, Lost).
*   **Total Pipeline Value:** Sum of the `dealValue` for ALL active leads.
*   **Total Revenue:** Sum of the `dealValue` for ONLY `Won` leads.

## 4. UI/UX Workflow & Features
*   **Lead Board:** A list or Kanban board displaying all leads. 
    *   *Must include:* A search bar (by Name or Company) and filters (by Status and Source).
*   **Lead Detail View:** Clicking a lead opens a detailed view showing all their information, a dropdown to change their status, and a timeline of Notes.
*   **Note Creation:** A simple text area inside the Lead Detail view to quickly add updates.
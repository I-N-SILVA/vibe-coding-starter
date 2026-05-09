# PLYAZ — User Flow Diagrams

All flows are rendered with Mermaid. Use GitHub, GitLab, or a Mermaid-compatible viewer to see the diagrams.

---

## Flow 1: New Organizer Onboarding

A new user registers as a league organizer, creates their first competition, and prepares it for launch.

```mermaid
flowchart TD
    A[Sign Up] --> B[Email Confirm]
    B --> C[Onboarding: Select Role = Organizer]
    C --> D[Create Organization — name + slug]
    D --> E[Manager Dashboard]
    E --> F{Setup checklist complete?}
    F -->|No| G[Create Competition]
    G --> H[Configure format + rules]
    H --> I[Create Teams]
    I --> J[Generate Fixtures]
    J --> K[Assign Referees]
    K --> L[Share Invite Links]
    L --> M[Activate Competition]
    M --> N[Operations Dashboard]
    F -->|Yes| N
```

---

## Flow 2: Player Journey

A player joins a team, registers for a competition, and tracks their match day status.

```mermaid
flowchart TD
    A[Sign Up / Receive Invite Link] --> B[Onboarding: Select Role = Player]
    B --> C{How to join a team?}
    C -->|Invite code| D[Enter team invite_code → join team]
    C -->|Discovery| E[Browse recruiting teams on Discovery Board]
    E --> F[Apply to team]
    F --> G{Application accepted?}
    G -->|Yes| D
    G -->|No| E
    D --> H[Player Dashboard]
    H --> I[Register for Competition]
    I --> J{Registration fee?}
    J -->|Free| K[Submit form]
    J -->|Paid| L[Stripe checkout]
    L --> M{Payment succeeded?}
    M -->|Yes| K
    M -->|No| N[Show error — retry]
    K --> O{Player is a minor?}
    O -->|Yes| P[Guardian consent email sent]
    O -->|No| Q[Registration approved]
    P --> R{Guardian consents via token link?}
    R -->|Yes| Q
    R -->|No| S[Registration stays pending]
    Q --> T[See match schedule]
    T --> U[Check convocation status before each match]
```

---

## Flow 3: Match Day (Referee)

The referee receives an assignment, opens the live console, and records events in real time.

```mermaid
flowchart TD
    A[Referee assigned to match by organizer] --> B[Open Referee Dashboard]
    B --> C[See match in Today section]
    C --> D[Tap START / RESUME]
    D --> E[Live console opens — /league/referee/live/id]
    E --> F[Start match — status changes to live]
    F --> G{Match event occurs}
    G -->|Goal| H[Record goal: player + minute + half]
    G -->|Own goal| I[Record own goal]
    G -->|Card| J[Record yellow or red card + player]
    G -->|Substitution| K[Record sub: player in + player out]
    G -->|Injury| L[Record injury]
    H --> M[Score increments in real time via Supabase Realtime]
    I --> M
    J --> M
    K --> M
    L --> M
    M --> N{End of match?}
    N -->|No| G
    N -->|Yes| O[End match — status set to completed]
    O --> P[Standings recalculated automatically]
    P --> Q[Player competition stats updated]
    Q --> R[Match visible in public scoreboard]
```

---

## Flow 4: Manager Operations

Day-to-day operations once a competition is live.

```mermaid
flowchart TD
    A[Manager Dashboard] --> B{Has active competition?}
    B -->|No| C[Setup Checklist shown]
    C --> D[Create competition]
    D --> E[Add teams]
    E --> F[Generate fixtures]
    F --> G[Assign referees]
    G --> H[Open registrations]
    H --> I[Activate competition]
    I --> A
    B -->|Yes| J[Operations Dashboard]
    J --> K[KPIs: leagues / teams / pending invites / live now]
    J --> L[Monitor live matches]
    J --> M[View upcoming fixtures]
    J --> N{Action needed?}
    N -->|Approve registration| O[Go to Registrations → approve or reject]
    N -->|Schedule match| P[Go to Matches → Schedule]
    N -->|Generate invite| Q[Quick Invite widget → copy link]
    N -->|View standings| R[Go to Standings]
    N -->|Analytics| S[Go to Analytics]
```

---

## Flow 5: Registration + Payment

The full player registration path including optional Stripe payment and guardian consent.

```mermaid
flowchart TD
    A[Player opens Registration page] --> B[Select competition]
    B --> C[Fill registration form — ID doc, DOB, jersey number, position]
    C --> D{Registration fee configured?}
    D -->|No fee| E[Submit registration directly]
    D -->|Fee required| F[Stripe Checkout opens]
    F --> G{Payment result}
    G -->|Success| H[Stripe webhook: mark registration as paid]
    G -->|Failed| I[Show payment error — retry]
    H --> E
    E --> J{Player is a minor?}
    J -->|No| K[Registration status: pending → approved]
    J -->|Yes| L[Guardian consent email dispatched]
    L --> M[Guardian opens consent link — /consent/token]
    M --> N{Guardian action}
    N -->|Consents| O[guardian_consented_at recorded]
    O --> K
    N -->|Ignores / denies| P[Registration stays pending — organizer notified]
    K --> Q[Player sees competition in their schedule]
```

---

## Flow 6: Public Fan Experience

A visitor explores the league without creating an account.

```mermaid
flowchart TD
    A[Visit /league/public] --> B[Live Scoreboard — real-time scores]
    B --> C{What to explore?}
    C -->|Teams| D[Browse Teams — /league/public/teams]
    D --> E[Team profile page — /league/public/teams/id]
    E --> F[See full roster + recent matches]
    F --> G[Click a player]
    G --> H[Public player profile — /league/public/players/id]
    H --> I[View stats: goals, assists, appearances, cards]
    I --> J[Share player card link]
    C -->|Standings| K[Browse Standings — /league/public/standings]
    K --> L[Select competition]
    L --> M[View league table with points, GD, form]
    C -->|Matches| N[Browse Matches — /league/public/matches]
    N --> O[Filter by competition or date]
    O --> P[See match events and scorers]
    C -->|Statistics| Q[Player leaderboards — /league/statistics]
    Q --> R[Top scorers, top assisters, most appearances]
```

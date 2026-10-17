# Paper 📝

**Paper** is a modern, minimal note-taking application inspired by Notion. It helps you create, organize, and manage your notes in a clean workspace designed for focused writing and productivity.

## ✨ Features

- 📝 **Create Notes** — Create notes and start writing instantly.
- 📚 **Organize Your Workspace** — Keep your notes organized in one place.
- ✏️ **Rich Text Editing** — Write and format content using a rich-text editor.
- ⚡ **Real-Time Data** — Manage notes with Convex's reactive database.
- 🗑️ **Delete Notes** — Remove notes you no longer need.
- 🎨 **Minimal UI** — A clean, distraction-free interface.
- 📱 **Responsive Design** — Designed to work across different screen sizes.

## 🛠️ Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Backend:** Convex
- **Editor:** TipTap
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- A [Convex](https://www.convex.dev/) account

### 1. Clone the repository

```bash
git clone https://github.com/BLACKEYE-ASTRO/paper.git
cd paper
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Convex

Start the Convex development environment:

```bash
npx convex dev
```

Follow the prompts to connect your project to a Convex deployment. Keep the Convex process running during development.

### 4. Start the development server

In another terminal, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```text
paper/
├── app/                 # Next.js application routes
├── components/          # Reusable UI components
├── convex/              # Convex schema, queries and mutations
├── public/              # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

*Note: The exact structure may vary depending on your implementation.*

## 💻 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Run the production server |
| `npm run lint` | Run lint checks, if configured |

## 🔐 Environment Variables

Configure any environment variables required by your project and Convex setup. Never commit API keys, passwords, or private credentials to GitHub.

## 🗺️ Roadmap

- [ ] Rich-text formatting and slash commands
- [ ] Note search
- [ ] Rename notes
- [ ] Folders and nested pages
- [ ] Dark mode
- [ ] Sharing and collaboration

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

## 📄 License

This project is available under the MIT License, unless otherwise specified.

---

Built with ❤️ by **Akash Shingare**.

[GitHub Repository](https://github.com/BLACKEYE-ASTRO/paper)
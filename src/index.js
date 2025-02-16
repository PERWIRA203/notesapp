class NotesInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.render();
    }
    render() {
        this.shadowRoot.innerHTML = `
        <style>
            form {
                display: grid;
                gap: 10px;
                padding: 20px;
            }
            label {
                font-weight: bold;
            }
            input, textarea {
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                width: 100%;
            }
            button {
                padding: 10px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            button:hover {
                background-color: #0056b3;
            }
            .loading {
                display: none;
                text-align: center;
                font-size: 14px;
                color: #007bff;
            }
        </style>
        <form id="notes-form">
            <label for="title">Title:</label>
            <input type="text" id="title" name="title" required>
            <label for="body">Body:</label>
            <textarea id="body" name="body" required></textarea>
            <button type="submit">Add Note</button>
            <p class="loading">Adding note...</p>
        </form>
        `;
        
        const form = this.shadowRoot.querySelector("#notes-form");
        const loadingIndicator = this.shadowRoot.querySelector(".loading");
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const title = this.shadowRoot.querySelector("#title").value.trim();
            const body = this.shadowRoot.querySelector("#body").value.trim();
            
            loadingIndicator.style.display = "block";
            try {
                const response = await fetch("https://notes-api.dicoding.dev/v2/notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, body })
                });
                if (response.ok) {
                    document.dispatchEvent(new CustomEvent("note-added"));
                    this.shadowRoot.querySelector("#notes-form").reset();
                }
            } catch (error) {
                console.error("Error adding note:", error);
            }
            loadingIndicator.style.display = "none";
        });
    }
}

class NotesComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.render();
        this.fetchNotes();
        document.addEventListener("note-added", () => this.fetchNotes());
    }
    render() {
        this.shadowRoot.innerHTML = `
        <style>
            .loading {
                text-align: center;
                font-size: 18px;
                color: #007bff;
                margin-top: 20px;
            }
            .container {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              padding: 20px;
            }
            .note {
              padding: 15px;
              background-color: #f1f1f1;
              border-radius: 10px;
              position: relative;
            }
            h2 {
              font-size: 1.2rem;
              font-weight: bold;
            }
            p {
              font-size: 1rem;
            }
            .delete-btn {
              position: absolute;
              top: 10px;
              right: 10px;
              background: red;
              color: white;
              border: none;
              padding: 5px 10px;
              cursor: pointer;
              border-radius: 5px;
            }
        </style>
        <p class="loading">Loading notes...</p>
        <div class="container"></div>
        `;
    }
    async fetchNotes() {
        const loadingIndicator = this.shadowRoot.querySelector(".loading");
        const container = this.shadowRoot.querySelector(".container");
        loadingIndicator.style.display = "block";
        try {
            const response = await fetch("https://notes-api.dicoding.dev/v2/notes");
            const { data } = await response.json();
            this.renderNotes(data);
        } catch (error) {
            console.error("Error fetching notes:", error);
            this.renderNotes([]);
        }
        loadingIndicator.style.display = "none";
    }
    async deleteNote(id) {
        try {
            const response = await fetch(`https://notes-api.dicoding.dev/v2/notes/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                this.fetchNotes();
            }
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    }
    renderNotes(notes = []) {
        const container = this.shadowRoot.querySelector(".container");
        container.innerHTML = notes.map(note => `
            <div class="note">
                <h2>${note.title}</h2>
                <p>${note.body}</p>
                <button class="delete-btn" data-id="${note.id}">Delete</button>
            </div>
        `).join("");
        this.shadowRoot.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", () => this.deleteNote(button.dataset.id));
        });
    }
}
class NotesFooter extends HTMLElement {
    constructor() {
      super();
     this.attachShadow({ mode: "open" });
      this.render();
    };
    render() {
        this.shadowRoot.innerHTML = 
        `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <style>
        .footer {
            padding: 20px 30px 20px;
            background-color: #000000;
            justify-content: center;
            align-items: center;
        }
        .icon {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .icon a {
            padding: 10px;
            margin: 10px;
            text-decoration: none;
            background-color: #ffffff;
            border-radius: 50%;
            transition: 0.5s;
        }
        .icon a i {
            display: flex;
            justify-content: center;
            font-size: 1.7em;
            color: black;
            transition: 0.5s;
        }
        .icon a i:hover {
            color: rgb(255, 255, 255);
            background-color: none;
        }
        .icon a:hover{
            background-color: black;
        }
        .copy {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .copy p {
            padding: 10px;
            color: #ffffff;
            font-size: 15px;
        }
        </style>
        <footer class="footer">
        <div class="icon">
            <a href=""><i class="fa-brands fa-instagram"></i></a>
            <a href=""><i class="fa-brands fa-facebook"></i></a>
            <a href=""><i class="fa-brands fa-twitter"></i></a>
        </div>
        <div class="copy"><p>Copyright &copy; 2025; Designed by PERWIRA203</p></div>
        </footer>
        `;
    }
    
}

customElements.define('notes-list', NotesComponent);
customElements.define('notes-form', NotesInput);
customElements.define('notes-footer', NotesFooter);

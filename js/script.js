
/* READ TEXT FROM AN ELEMENT */

function readText(element) {
    if (element) {
        return element.textContent.replace(/\s+/g, " ").trim();
    }

    return "";
}


/* =========================================
   1. PORTFOLIO FILTERS
========================================= */

function setupPortfolioFilters() {
    const grid = document.querySelector(
        ".portfolio-projects .project-grid"
    );

    if (!grid) return;

    const cards = grid.querySelectorAll(".project-card");

    if (cards.length === 0) return;

    grid.id = grid.id || "portfolioProjectGrid";

    const toolbar = document.createElement("div");
    toolbar.className = "portfolio-filter-bar";

    const controls = document.createElement("div");
    controls.className = "portfolio-filters";
    controls.setAttribute("role", "group");
    controls.setAttribute(
        "aria-label",
        "Filter portfolio projects"
    );

    const status = document.createElement("p");
    status.className = "portfolio-filter-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");


    function getCategory(card) {
        const category = readText(
            card.querySelector(".project-category")
        );

        if (category.indexOf("3D") !== -1) {
            return "3d";
        }

        return "graphic";
    }


    function countProjects(category) {
        let count = 0;

        for (let i = 0; i < cards.length; i++) {
            if (
                category === "all" ||
                getCategory(cards[i]) === category
            ) {
                count++;
            }
        }

        return count;
    }


    function filterProjects(event) {
        const selected = event.currentTarget;
        const category = selected.getAttribute("data-filter");
        const buttons = controls.querySelectorAll("button");

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].setAttribute(
                "aria-pressed",
                String(buttons[i] === selected)
            );
        }

        for (let i = 0; i < cards.length; i++) {
            cards[i].hidden =
                category !== "all" &&
                getCategory(cards[i]) !== category;

            cards[i].classList.remove("reveal-pending");
        }

        status.textContent =
            "Showing " + countProjects(category) +
            " of " + cards.length + " projects";

        if (category !== "all") {
            status.textContent +=
                " · " + selected.getAttribute("data-label");
        }
    }


    const filters = [
        { value: "all", label: "All" },
        { value: "graphic", label: "Graphic Design" },
        { value: "3d", label: "3D Modelling" }
    ];

    for (let i = 0; i < filters.length; i++) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "portfolio-filter";

        button.setAttribute("data-filter", filters[i].value);
        button.setAttribute("data-label", filters[i].label);
        button.setAttribute("aria-controls", grid.id);

        button.setAttribute(
            "aria-pressed",
            String(filters[i].value === "all")
        );

        button.textContent =
            filters[i].label +
            " (" + countProjects(filters[i].value) + ")";

        button.addEventListener("click", filterProjects);

        controls.appendChild(button);
    }

    status.textContent =
        "Showing " + cards.length +
        " of " + cards.length + " projects";

    toolbar.appendChild(controls);
    toolbar.appendChild(status);

    grid.parentNode.insertBefore(toolbar, grid);
}


/* =========================================
   2. PROJECT DETAILS POPUP
========================================= */

function setupProjectPopup() {
    const dialog = document.getElementById("projectPreview");
    const image = document.getElementById("previewImage");
    const title = document.getElementById("projectTitle");
    const close = document.getElementById("closeProject");

    if (!dialog || !image || !title || !close) return;

    const content = dialog.querySelector(
        ".project-dialog-content"
    );

    const imagePanel = dialog.querySelector(
        ".project-dialog-image"
    );

    if (!content || !imagePanel) return;


    const projectDetails = {
        "poster-foodbank.jpg": {
            tools: "Canva",
            goal: "Create a clear promotional poster for the Foodbank JAKMAS programme.",
            focus: [
                "Visual communication",
                "Promotional layout",
                "Information hierarchy"
            ]
        },

        "poster-pidato.png": {
            tools: "Canva",
            goal: "Present the speech competition and its event information through an organised poster layout.",
            focus: [
                "Typography",
                "Event information",
                "Visual composition"
            ]
        },

        "character-model.png": {
            tools: "Blender",
            goal: "Develop a stylised 3D character and explore its visual presentation.",
            focus: [
                "Character modelling",
                "Proportions",
                "Materials"
            ]
        },

        "bedroom-scene.png": {
            tools: "Blender",
            goal: "Create a 3D bedroom interior with arranged objects and considered lighting.",
            focus: [
                "Object modelling",
                "Scene arrangement",
                "Lighting and rendering"
            ]
        },

        "donut-shop.png": {
            tools: "Blender",
            goal: "Design and model a creative 3D shop environment.",
            focus: [
                "Environment design",
                "Object placement",
                "Visual composition"
            ]
        }
    };


    const body = document.createElement("div");
    body.className = "project-dialog-body";

    const media = document.createElement("div");
    media.className = "project-dialog-media";

    const fullImageLink = document.createElement("a");
    fullImageLink.className = "project-full-image";
    fullImageLink.textContent = "View Full Image ↗";
    fullImageLink.setAttribute("aria-label", "View full image");

    const details = document.createElement("section");
    details.className = "project-details";
    details.setAttribute("aria-label", "Project information");

    details.innerHTML =
        '<p class="project-detail-category" id="projectCategory"></p>' +
        '<p class="project-description" id="projectDescription"></p>' +

        '<dl class="project-facts">' +
            '<div>' +
                '<dt>Project type</dt>' +
                '<dd id="projectType"></dd>' +
            '</div>' +

            '<div id="projectToolsRow">' +
                '<dt>Software</dt>' +
                '<dd id="projectTools"></dd>' +
            '</div>' +
        '</dl>' +

        '<h2 class="project-detail-heading">Project goal</h2>' +
        '<p class="project-goal" id="projectGoal"></p>' +

        '<h2 class="project-detail-heading">Areas explored</h2>' +
        '<ul class="project-focus" id="projectFocus"></ul>';

    media.appendChild(imagePanel);
    media.appendChild(fullImageLink);

    body.appendChild(media);
    body.appendChild(details);

    content.appendChild(body);

    dialog.setAttribute(
        "aria-describedby",
        "projectDescription"
    );

    let opener = null;


    function openProject(event) {
        const button = event.currentTarget;
        const card = button.closest(".project-card");
        const imagePath = button.getAttribute("data-image");

        if (!card || !imagePath) return;

        const description = readText(
            card.querySelector(".project-info > p")
        );

        const filename = imagePath.split("/").pop();

        let data = projectDetails[filename];

        if (!data) {
            data = {
                tools: "",
                goal: description,
                focus: []
            };
        }

        title.textContent =
            button.getAttribute("data-title") ||
            readText(card.querySelector("h3"));

        const thumbnail = card.querySelector("img");

        image.src = imagePath;

        if (thumbnail) {
            image.alt = thumbnail.alt;
        } else {
            image.alt = title.textContent;
        }

        fullImageLink.href = imagePath;

        document.getElementById("projectCategory").textContent =
            readText(card.querySelector(".project-category"));

        document.getElementById("projectDescription").textContent =
            description;

        document.getElementById("projectType").textContent =
            readText(card.querySelector(".portfolio-project-type"));

        document.getElementById("projectToolsRow").hidden =
            !data.tools;

        document.getElementById("projectTools").textContent =
            data.tools;

        document.getElementById("projectGoal").textContent =
            data.goal;

        const list = document.getElementById("projectFocus");

        list.textContent = "";

        for (let i = 0; i < data.focus.length; i++) {
            const item = document.createElement("li");

            item.textContent = data.focus[i];

            list.appendChild(item);
        }

        opener = button;

        dialog.showModal();
        dialog.scrollTop = 0;

        document.documentElement.classList.add(
            "project-modal-open"
        );

        close.focus({ preventScroll: true });
    }


    const projectButtons = document.querySelectorAll(
        ".view-project-btn"
    );

    for (let i = 0; i < projectButtons.length; i++) {
        projectButtons[i].addEventListener(
            "click",
            openProject
        );
    }


    close.addEventListener("click", function() {
        dialog.close();
    });


    dialog.addEventListener("click", function(event) {
        const rect = dialog.getBoundingClientRect();

        const outside =
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom;

        if (event.target === dialog && outside) {
            dialog.close();
        }
    });


    dialog.addEventListener("close", function() {
        document.documentElement.classList.remove(
            "project-modal-open"
        );

        image.removeAttribute("src");

        if (
            opener &&
            opener.isConnected &&
            !opener.closest("[hidden]")
        ) {
            opener.focus({ preventScroll: true });
        }
    });
}


/* =========================================
   3. IMAGE-ONLY POPUP
   Click outside the image to close.
========================================= */

function setupFullImageViewer() {
    const projectDialog = document.getElementById(
        "projectPreview"
    );

    const previewImage = document.getElementById(
        "previewImage"
    );

    if (!projectDialog || !previewImage) return;

    const openButton = projectDialog.querySelector(
        ".project-full-image"
    );

    if (!openButton) return;


    /* Create a popup containing only the image */

    const viewer = document.createElement("dialog");

    viewer.id = "fullImageViewer";
    viewer.className = "image-only-viewer";

    viewer.setAttribute(
        "aria-label",
        "Full image preview"
    );

    const largeImage = document.createElement("img");

    largeImage.className = "image-only-photo";
    largeImage.alt = "";

    viewer.appendChild(largeImage);
    document.body.appendChild(viewer);


    /* Connect the View Full Image control */

    openButton.removeAttribute("target");
    openButton.setAttribute("role", "button");
    openButton.setAttribute("aria-label", "View full image");
    openButton.setAttribute("aria-haspopup", "dialog");
    openButton.setAttribute("aria-controls", viewer.id);


    openButton.addEventListener("click", function(event) {
        event.preventDefault();

        if (!previewImage.getAttribute("src")) return;

        largeImage.src = previewImage.src;
        largeImage.alt = previewImage.alt;

        viewer.setAttribute(
            "aria-label",
            "Full image: " + previewImage.alt
        );

        viewer.showModal();
    });


    /* Allow opening with the Space key */

    openButton.addEventListener("keydown", function(event) {
        if (event.key === " ") {
            event.preventDefault();
            openButton.click();
        }
    });


    /* Click outside the image to close */

    viewer.addEventListener("click", function(event) {
        if (event.target !== largeImage) {
            viewer.close();
        }
    });


    /* Return to the project details */

    viewer.addEventListener("close", function() {
        largeImage.removeAttribute("src");

        if (projectDialog.open) {
            openButton.focus({ preventScroll: true });
        }
    });


    projectDialog.addEventListener("close", function() {
        if (viewer.open) {
            viewer.close();
        }
    });
}


/* =========================================
   4. COMMENTS FORM
========================================= */

function setupCommentForm() {
    const form = document.getElementById("commentForm");
    const success = document.getElementById("commentSuccess");
    const nameInput = document.getElementById("fullName");

    if (!form || !success || !nameInput) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = nameInput.value.trim();

        if (name === "") {
            success.textContent = "Please enter your name.";
            success.hidden = false;

            nameInput.focus();

            return;
        }

        success.textContent =
            "Thank you, " + name +
            "! Your feedback has been completed successfully. " +
            "This is a website demo, so the message " +
            "is not sent or stored.";

        success.hidden = false;

        form.reset();
    });
}


/* =========================================
   5. SCROLL ANIMATIONS
========================================= */

function setupScrollAnimation() {
    const motion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    if (motion.matches) return;

    const targets = document.querySelectorAll(
        ".project-card, .info-card, .education-card, " +
        ".achievement-card, .skill-card, " +
        ".blender-video-card, .video-process-card, " +
        ".comment-intro-card, .feedback-form-card, " +
        ".about-image"
    );


    for (let i = 0; i < targets.length; i++) {
        targets[i].classList.add("scroll-reveal");

        targets[i].style.setProperty(
            "--reveal-delay",
            (i % 3) * 60 + "ms"
        );

        if (
            targets[i].getBoundingClientRect().top >=
            window.innerHeight
        ) {
            targets[i].classList.add("reveal-pending");
        }
    }


    function revealCards() {
        for (let i = 0; i < targets.length; i++) {
            if (
                targets[i].getBoundingClientRect().top <
                window.innerHeight - 32
            ) {
                targets[i].classList.remove("reveal-pending");
            }
        }
    }

    window.addEventListener("scroll", revealCards);
    window.addEventListener("resize", revealCards);


    document.addEventListener("focusin", function(event) {
        const target = event.target.closest(
            ".reveal-pending"
        );

        if (target) {
            target.classList.remove("reveal-pending");
        }
    });


    motion.addEventListener("change", function(event) {
        if (event.matches) {
            window.removeEventListener(
                "scroll",
                revealCards
            );

            window.removeEventListener(
                "resize",
                revealCards
            );

            for (let i = 0; i < targets.length; i++) {
                targets[i].classList.remove(
                    "reveal-pending"
                );
            }
        }
    });

    revealCards();
}


/* START THE WEBSITE FUNCTIONS */

setupPortfolioFilters();
setupProjectPopup();
setupFullImageViewer();
setupCommentForm();
setupScrollAnimation();

/* =========================================
   LOGO ANIMATION AND SCROLL PROGRESS
========================================= */

function setupVisualEffects() {
    const logo = document.querySelector(".logo");

    if (logo) {
        logo.classList.add("logo-intro");
    }

    if (document.querySelector(".scroll-progress")) {
        return;
    }

    const bar = document.createElement("div");

    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");

    document.body.appendChild(bar);


    function updateProgress() {
        const page = document.documentElement;

        const distance =
            page.scrollHeight - page.clientHeight;

        if (distance <= 0) {
            bar.hidden = true;
            return;
        }

        bar.hidden = false;

        const progress = Math.min(
            1,
            Math.max(0, window.scrollY / distance)
        );

        bar.style.transform =
            "scaleX(" + progress + ")";
    }


    window.addEventListener("scroll", updateProgress);
    window.addEventListener("resize", updateProgress);
    window.addEventListener("load", updateProgress);

    document.addEventListener("click", updateProgress);

    updateProgress();
}

setupVisualEffects();

/* =========================================
   BACK TO TOP
========================================= */

function setupBackToTop() {
    if (document.querySelector(".back-to-top")) return;

    const button = document.createElement("button");

    button.type = "button";
    button.className = "back-to-top";
    button.setAttribute("aria-label", "Back to top");

    button.innerHTML =
        '<span aria-hidden="true">↑</span>' +
        '<span>Top</span>';

    document.body.appendChild(button);


    function updateVisibility() {
        const page = document.documentElement;

        const distance =
            page.scrollHeight - page.clientHeight;

        const threshold = Math.min(450, distance / 2);

        if (distance > 0 && window.scrollY > threshold) {
            button.classList.add("is-visible");
        } else {
            button.classList.remove("is-visible");
        }
    }


    button.addEventListener("click", function() {
        const logo = document.querySelector(".logo");

        if (logo) {
            logo.focus({ preventScroll: true });
        }

        const motion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        if (motion.matches) {
            window.scrollTo({
                top: 0,
                behavior: "instant"
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    });


    window.addEventListener("scroll", updateVisibility);
    window.addEventListener("resize", updateVisibility);
    window.addEventListener("load", updateVisibility);
    window.addEventListener("pageshow", updateVisibility);

    updateVisibility();
}


/* =========================================
   EDUCATION TIMELINE
========================================= */

function setupEducationTimeline() {
    const list = document.querySelector(".education-list");

    if (
        !list ||
        list.classList.contains("education-timeline")
    ) {
        return;
    }

    const cards = list.querySelectorAll(".education-card");

    if (cards.length === 0) return;

    list.classList.add("education-timeline");

    list.setAttribute("role", "list");
    list.setAttribute(
        "aria-label",
        "Education timeline, from secondary school to university"
    );


    /* Change the original Degree → STPM → SPM order
       into SPM → STPM → Degree. */

    for (let i = cards.length - 1; i >= 0; i--) {
        cards[i].setAttribute("role", "listitem");

        const date = cards[i].querySelector(
            ".education-date"
        );

        if (
            date &&
            date.textContent.toUpperCase()
                .indexOf("CURRENT") !== -1
        ) {
            cards[i].classList.add("education-current");
        }

        list.appendChild(cards[i]);
    }
}

setupBackToTop();
setupEducationTimeline();

/* View All Programmes / Show Less */
function setupProgrammeToggle() {
    const grid = document.querySelector(".program-grid");

    if (!grid || grid.hasAttribute("data-programmes-ready")) {
        return;
    }

    const cards = grid.querySelectorAll(".achievement-card");
    const previewCount = 4;

    if (cards.length <= previewCount) {
        return;
    }

    grid.setAttribute("data-programmes-ready", "true");

    if (!grid.id) {
        grid.id = "programmesGrid";
    }

    /* Create the controls below the programme list. */
    const actions = document.createElement("div");
    actions.className = "programme-actions";

    const status = document.createElement("p");
    status.className = "programme-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "programme-toggle";
    button.setAttribute("aria-controls", grid.id);

    let expanded = false;

    function updateProgrammes() {
        for (let i = 0; i < cards.length; i++) {
            cards[i].hidden = !expanded && i >= previewCount;

            if (!cards[i].hidden) {
                cards[i].classList.remove("reveal-pending");
            }
        }

        button.setAttribute("aria-expanded", String(expanded));

        if (expanded) {
            button.textContent = "Show Less";
            status.textContent =
                "Showing all " + cards.length + " programmes";
        } else {
            button.textContent =
                "View All Programmes (" + cards.length + ")";

            status.textContent =
                "Showing " + previewCount +
                " of " + cards.length + " programmes";
        }

        /* Update existing scroll effects after the layout changes. */
        window.dispatchEvent(new Event("resize"));
    }

    button.addEventListener("click", function() {
        expanded = !expanded;
        updateProgrammes();

        if (!expanded) {
            const motion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

            button.scrollIntoView({
                block: "center",
                behavior: motion.matches ? "instant" : "smooth"
            });
        }
    });

    actions.appendChild(status);
    actions.appendChild(button);

    grid.parentNode.insertBefore(actions, grid.nextSibling);

    updateProgrammes();
}

setupProgrammeToggle();
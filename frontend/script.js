function login(role) {
	document.getElementById("login-container").classList.add("hidden");
	document.getElementById("dashboard").classList.remove("hidden");
}

function logout() {
	document.getElementById("dashboard").classList.add("hidden");
	document.getElementById("login-container").classList.remove("hidden");
}

function showSection(sectionId) {
	const sections = document.querySelectorAll(".section");
	sections.forEach((sec) => {
		sec.classList.add("hidden");
	});
	document.getElementById(sectionId).classList.remove("hidden");
}

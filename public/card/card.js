function toggleInfo(btn) {
    const moreInfo = btn.previousElementSibling;
    if (moreInfo.style.display === "none" || !moreInfo.style.display) {
        moreInfo.style.display = "block";
        btn.textContent = "Show Less";
    } else {
        moreInfo.style.display = "none";
        btn.textContent = "Read More";
    }
}

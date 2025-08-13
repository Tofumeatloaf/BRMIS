document.querySelector('.announcement-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Stop default submit for now
    const category = document.querySelector('select[name="category"]').value;

    if (category === 'Announcements') {
        console.log('Posting to Announcements...');
        // Code for announcements
    } else if (category === 'News') {
        console.log('Posting to News...');
        // Code for news
    }

    // Then submit to server or redirect
});

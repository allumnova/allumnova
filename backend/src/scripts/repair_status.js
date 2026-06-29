async function repair() {
    console.log('✨ Skip repair status: database running on B2B schema.');
}

repair()
    .catch(console.error);

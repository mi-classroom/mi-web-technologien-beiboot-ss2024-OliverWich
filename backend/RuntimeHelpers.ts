export function registerExitHandlers () {
    process.on("SIGINT", () => {
        console.log("Received SIGINT, dying");
        process.exit()
    });

    process.on("SIGTERM", () => {
        console.log("Received SIGTERM, dying");
        process.exit()
    });

}

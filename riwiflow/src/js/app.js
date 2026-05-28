import { router } from "./router";

window.addEventListener('popstate', router);

router();


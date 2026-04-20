import { withRealtime } from "../../core/realtime/events.js";
import { repo } from "../../infra/db/repo.js";

export const studentRepo = withRealtime(repo.students, "students");

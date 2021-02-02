package eu.ebrains.kg.editor.models;

import java.util.UUID;

public class Error {
        private int code;
        private String message;
        private UUID instanceId;

        public int getCode() {
            return code;
        }

        public void setCode(int code) {
            this.code = code;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public UUID getInstanceId() {
            return instanceId;
        }

        public void setInstanceId(UUID instanceId) {
            this.instanceId = instanceId;
        }
}

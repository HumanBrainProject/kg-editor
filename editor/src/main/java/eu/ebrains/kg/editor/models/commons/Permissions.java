package eu.ebrains.kg.editor.models.commons;

import java.util.List;

public class Permissions {

    private Permissions(boolean canCreate, boolean canInviteForReview, boolean canDelete, boolean canInviteForSuggestion, boolean canRead, boolean canSuggest, boolean canWrite, boolean canRelease) {
        this.canCreate = canCreate;
        this.canInviteForReview = canInviteForReview;
        this.canDelete = canDelete;
        this.canInviteForSuggestion = canInviteForSuggestion;
        this.canRead = canRead;
        this.canSuggest = canSuggest;
        this.canWrite = canWrite;
        this.canRelease = canRelease;
    }

    public static Permissions fromPermissionList(List<String> permissions){
        return new Permissions(
                permissions.contains("CREATE"),
                permissions.contains("INVITE_FOR_REVIEW"),
                permissions.contains("DELETE"),
                permissions.contains("INVITE_FOR_SUGGESTION"),
                permissions.contains("READ"),
                permissions.contains("SUGGEST"),
                permissions.contains("WRITE"),
                permissions.contains("RELEASE")
        );
    }

    private final boolean canCreate;
    private final boolean canInviteForReview;
    private final boolean canDelete;
    private final boolean canInviteForSuggestion;
    private final boolean canRead;
    private final boolean canSuggest;
    private final boolean canWrite;
    private final boolean canRelease;

    public boolean isCanCreate() {
        return canCreate;
    }

    public boolean isCanInviteForReview() {
        return canInviteForReview;
    }

    public boolean isCanDelete() {
        return canDelete;
    }

    public boolean isCanInviteForSuggestion() {
        return canInviteForSuggestion;
    }

    public boolean isCanRead() {
        return canRead;
    }

    public boolean isCanSuggest() {
        return canSuggest;
    }

    public boolean isCanWrite() {
        return canWrite;
    }

    public boolean isCanRelease() {
        return canRelease;
    }
}

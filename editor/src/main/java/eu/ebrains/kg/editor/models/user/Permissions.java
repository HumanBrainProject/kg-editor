package eu.ebrains.kg.editor.models.user;

import java.util.List;

public class Permissions {

    public static Permissions fromPermissionList(List<String> permissions){
        Permissions p = new Permissions();
        p.setCanCreate(permissions.contains("CREATE"));
        p.setCanInviteForReview(permissions.contains("INVITE_FOR_REVIEW"));
        p.setCanDelete(permissions.contains("DELETE"));
        p.setCanInviteForSuggestion(permissions.contains("INVITE_FOR_SUGGESTION"));
        p.setCanRead(permissions.contains("READ"));
        p.setCanSuggest(permissions.contains("SUGGEST"));
        p.setCanWrite(permissions.contains("WRITE"));
        p.setCanRelease(permissions.contains("RELEASE"));
        return p;
    }


    private boolean canCreate;
    private boolean canInviteForReview;
    private boolean canDelete;
    private boolean canInviteForSuggestion;
    private boolean canRead;
    private boolean canSuggest;
    private boolean canWrite;
    private boolean canRelease;

    public boolean isCanCreate() { return canCreate; }

    public void setCanCreate(boolean canCreate) { this.canCreate = canCreate; }

    public boolean isCanInviteForReview() { return canInviteForReview; }

    public void setCanInviteForReview(boolean canInviteForReview) { this.canInviteForReview = canInviteForReview; }

    public boolean isCanDelete() { return canDelete; }

    public void setCanDelete(boolean canDelete) { this.canDelete = canDelete; }

    public boolean isCanInviteForSuggestion() { return canInviteForSuggestion; }

    public void setCanInviteForSuggestion(boolean canInviteForSuggestion) { this.canInviteForSuggestion = canInviteForSuggestion; }

    public boolean isCanRead() { return canRead; }

    public void setCanRead(boolean canRead) { this.canRead = canRead; }

    public boolean isCanSuggest() { return canSuggest; }

    public void setCanSuggest(boolean canSuggest) { this.canSuggest = canSuggest; }

    public boolean isCanWrite() { return canWrite; }

    public void setCanWrite(boolean canWrite) { this.canWrite = canWrite; }

    public boolean isCanRelease() { return canRelease; }

    public void setCanRelease(boolean canRelease) { this.canRelease = canRelease; }
}

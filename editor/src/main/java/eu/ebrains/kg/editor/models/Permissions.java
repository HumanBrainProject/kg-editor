package eu.ebrains.kg.editor.models;

public class Permissions {
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

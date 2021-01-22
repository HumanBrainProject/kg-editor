package eu.ebrains.kg.editor.models;

import java.util.List;

public class StructureOfField {
    private final String fullyQualifiedName;
    private final String name;
    private final String label;
    private final Integer numOfOccurrences;
    private final String widget;
    private final String labelTooltip;
    private final Boolean markdown;
    private final Boolean searchable;
    private final Boolean allowCustomValues;
    private final Integer order;
    private final List<StructureOfField> fields;

    public StructureOfField(String fullyQualifiedName, String name, String label, Integer numOfOccurrences, String widget, String labelTooltip, Boolean markdown, Boolean searchable, Boolean allowCustomValues, Integer order, List<StructureOfField> fields) {
        this.fullyQualifiedName = fullyQualifiedName;
        this.name = name;
        this.label = label;
        this.numOfOccurrences = numOfOccurrences;
        this.widget = widget;
        this.labelTooltip = labelTooltip;
        this.markdown = markdown;
        this.searchable = searchable;
        this.allowCustomValues = allowCustomValues;
        this.order = order;
        this.fields = fields;
    }

    public String getFullyQualifiedName() {
        return fullyQualifiedName;
    }

    public String getName() {
        return name;
    }

    public String getLabel() {
        return label;
    }

    public Integer getNumOfOccurrences() {
        return numOfOccurrences;
    }

    public String getWidget() {
        return widget;
    }

    public String getLabelTooltip() {
        return labelTooltip;
    }

    public Boolean getMarkdown() {
        return markdown;
    }

    public Boolean getSearchable() {
        return searchable;
    }

    public Boolean getAllowCustomValues() {
        return allowCustomValues;
    }

    public Integer getOrder() {
        return order;
    }

    public List<StructureOfField> getFields() {
        return fields;
    }
}

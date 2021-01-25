package eu.ebrains.kg.editor.models.instance;

public class SimpleType {

    public SimpleType(String name) {
        this.name = name;
    }

    private final String name;
    private String label;
    private String color;

    public String getName() {
        return name;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}

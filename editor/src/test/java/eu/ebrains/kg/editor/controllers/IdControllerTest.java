package eu.ebrains.kg.editor.controllers;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class IdControllerTest {

    private IdController controller = new IdController("http://foobar/");


    @Test
    void simplifyFullyQualifiedId() {

        //given
        String toTest = "http://foobar/1bda8d6d-7333-42f5-aff5-32c87dceffbf";

        //when
        UUID uuid = controller.simplifyFullyQualifiedId(toTest);

        //then
        assertNotNull(uuid);

    }

    @Test
    void simplifyFullyQualifiedIdWrongPrefix() {

        //given
        String toTest = "http://barfoo/1bda8d6d-7333-42f5-aff5-32c87dceffbf";

        //when
        UUID uuid = controller.simplifyFullyQualifiedId(toTest);

        //then
        assertNull(uuid);

    }


    @Test
    void simplifyFullyQualifiedIdWrongUUID() {

        //given
        String toTest = "http://foobar/abc";

        //when
        UUID uuid = controller.simplifyFullyQualifiedId(toTest);

        //then
        assertNull(uuid);

    }
}
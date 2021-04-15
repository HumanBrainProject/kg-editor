package eu.ebrains.kg.service.controllers;

import org.junit.jupiter.api.Test;

import java.util.*;

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


    @Test
    void fullyQualifyAtId() {
        //Given
        String randomUUID = "e7fb54ee-1b68-4f76-9bcd-b3a72903c7fd";
        Map<String, Object> atId = new HashMap<>();
        atId.put("@id", randomUUID);

        Map<String, Object> toTest = new HashMap<>();
        Map<String, Object> nested = new HashMap<>();
        nested.put("http://foobarNestedObj", atId);
        nested.put("http://foobarNestedArrayObj", Collections.singletonList(atId));

        toTest.put("http://foobarString", "testSimple");
        toTest.put("http://foobarArray", Arrays.asList("1", "2"));
        toTest.put("http://foobarObject", atId);

        toTest.put("http://foobarNested", nested);
        toTest.put("http://foobarNestedArray", nested);

        //When
        Map<?, ?> result = controller.fullyQualifyAtId(toTest);
        Map<String, Object> r = (Map<String, Object>) result.get("http://foobarNested");
        Object n = ((Map<String, Object>)r.get("http://foobarNestedObj")).get("@id");
        String expected = String.format("http://foobar/%s", randomUUID);

        //Then
        assertEquals(expected, n);
    }
}
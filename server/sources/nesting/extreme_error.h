// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <string>
#include <list>
#include <utility>
#include "extreme_json.h"

enum class ErrorCode : int
{
    JsonSchemaIsNotValid = -3000,
    UnexpectedError = -4000,
    JsonParseError = -5000,
    MaxNumberOfParts = -6000,
    DuplicatedPartsIDs = -7000,
    DuplicatedSheetsIDs = -8000,
    UnexpectedError2 = -1000,
    InvalidGeometry = -996,
    InvalidSheet = -994,
    InvalidOrientation = -989,
    HoleIsNotCompatible = -981,
    GeometryIsSelfIntersecting = -979,
    BadUserParam = -973,
    InvalidContour = -971
};

struct Error
{
    ErrorCode code;
    std::string message;
    std::list<std::pair<std::string, int> > path;
    std::list<int> parts;
    std::list<int> sheets;

    Error(const std::string& error_message)
    {
        code = ErrorCode::UnexpectedError;
        message = error_message;
    }
};

inline std::string generateJson(const std::list<Error>& errors, const std::string& main_error_message = "An error occured")
{
    using namespace ExtremeJson;

    Object root;
    root.children.push_back(Object::item_t("message", String::make(main_error_message)));

    Array* errors_json = new Array();
    root.children.push_back(Object::item_t("errors", writable_ptr(errors_json)));

    for (auto error : errors)
    {
        Object* error_json = new Object();
        errors_json->children.push_back(writable_ptr(error_json));

        error_json->children.push_back(Object::item_t("error_code", Integer::make(static_cast<int>(error.code))));
        error_json->children.push_back(Object::item_t("message", String::make(error.message)));

        if (!error.path.empty())
        {
            Array* path_json = new Array();
            error_json->children.push_back(Object::item_t("path", writable_ptr(path_json)));
            for (auto item : error.path)
            {
                path_json->children.push_back(String::make(item.first));
                if (item.second != -1)
                {
                    path_json->children.push_back(Integer::make(item.second));
                }
            }
        }
        if (!error.parts.empty())
        {
            Array* parts_json = new Array();
            error_json->children.push_back(Object::item_t("parts", writable_ptr(parts_json)));
            for (auto part_id : error.parts)
            {
                parts_json->children.push_back(Integer::make(part_id));
            }
        }
        if (!error.sheets.empty())
        {
            Array* sheets_json = new Array();
            error_json->children.push_back(Object::item_t("sheets", writable_ptr(sheets_json)));
            for (auto sheet_id : error.sheets)
            {
                sheets_json->children.push_back(Integer::make(sheet_id));
            }
        }
    }

    Output output;
    root.write(output);
    return output.getOutput();
}

inline std::string generateJson(const Error& error, const std::string& main_error_message = "An error occured")
{
    std::list<Error> errors;
    errors.push_back(error);
    return generateJson(errors, main_error_message);
}

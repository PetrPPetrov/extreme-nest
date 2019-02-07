// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <sstream>
#include <list>
#include <map>
#include <utility>
#include <boost/smart_ptr/shared_ptr.hpp>
#include <boost/smart_ptr/make_shared.hpp>

namespace ExtremeJson
{
    class Output
    {
        std::stringstream stream;
        size_t cur_indent = 0;
        size_t indent_size = 4;
    public:
        void writeIndent()
        {
            stream << std::string(cur_indent * indent_size, ' ');
        }
        void write(const std::string& value)
        {
            writeIndent();
            stream << value;
        }
        void writeLn(const std::string& value)
        {
            write(value);
            write("\n");
        }
        void rawWrite(const std::string& value)
        {
            stream << value;
        }
        void setIndentSize(size_t indent_size_)
        {
            indent_size = indent_size_;
        }
        void increaseIndent()
        {
            cur_indent++;
        }
        void decreaseIndent()
        {
            cur_indent--;
        }
        std::string getOutput()
        {
            return stream.str();
        }
    };
    class Scope
    {
        Output& output;
    public:
        Scope(Output& output_) : output(output_)
        {
            output.increaseIndent();
        }
        ~Scope()
        {
            output.decreaseIndent();
        }
    };
    struct Writable
    {
        virtual void write(Output& output) = 0;
        virtual ~Writable()
        {
        }
    };
    typedef boost::shared_ptr<Writable> writable_ptr;
    struct String : public Writable
    {
        std::string value;

        String(const std::string& value_) : value(value_)
        {
        }
        virtual void write(Output& output) override
        {
            std::stringstream temp;
            temp << "\"" << value << "\"";
            output.rawWrite(temp.str());
        }
        static writable_ptr make(const std::string& value_)
        {
            return writable_ptr(new String(value_));
        }
    };
    struct Boolean : public Writable
    {
        bool value;

        Boolean(bool value_) : value(value_)
        {
        }
        virtual void write(Output& output) override
        {
            output.rawWrite(value ? "true" : "false");
        }
        static writable_ptr make(bool value_)
        {
            return writable_ptr(new Boolean(value_));
        }
    };
    struct Number : public Writable
    {
        double number;

        Number(double number_) : number(number_)
        {
        }
        virtual void write(Output& output) override
        {
            output.rawWrite(std::to_string(number));
        }
        static writable_ptr make(double number_)
        {
            return writable_ptr(new Number(number_));
        }
    };
    struct Integer : public Writable
    {
        int integer;

        Integer(int integer_) : integer(integer_)
        {
        }
        virtual void write(Output& output) override
        {
            output.rawWrite(std::to_string(integer));
        }
        static writable_ptr make(int integer_)
        {
            return writable_ptr(new Integer(integer_));
        }
    };
    struct Object : public Writable
    {
        //typedef std::map<std::string, writable_ptr> children_t;
        typedef std::list<std::pair<std::string, writable_ptr> > children_t;
        typedef children_t::value_type item_t;
        children_t children;

        virtual void write(Output& output) override
        {
            output.rawWrite("{\n");
            {
                Scope scope(output);
                bool first = true;
                for (auto child : children)
                {
                    if (!first)
                    {
                        output.rawWrite(",\n");
                    }
                    output.writeIndent();
                    String(child.first).write(output);
                    output.rawWrite(": ");
                    child.second->write(output);
                    first = false;
                }
                output.rawWrite("\n");
            }
            output.write("}");
        }
        static writable_ptr make()
        {
            return writable_ptr(new Object());
        }
    };
    struct Array : public Writable
    {
        std::list<writable_ptr> children;

        virtual void write(Output& output) override
        {
            output.rawWrite("[\n");
            {
                Scope scope(output);
                bool first = true;
                for (auto child : children)
                {
                    if (!first)
                    {
                        output.rawWrite(",\n");
                    }
                    output.writeIndent();
                    child->write(output);
                    first = false;
                }
                output.rawWrite("\n");
            }
            output.write("]");
        }
        static writable_ptr make()
        {
            return writable_ptr(new Array());
        }
    };
}

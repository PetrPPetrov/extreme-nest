// Copyright (c) 2018 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <iostream>
#include <fstream>
#include <boost/iostreams/stream.hpp>
#include <boost/system/error_code.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>
#include <boost/iostreams/device/null.hpp>

#define LINE_SEPARATOR "********************************"
#define ENDL_SEPARATOR "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"

extern std::ofstream* g_log_file;

#define REPORT_LOG_TYPE(out, log_type) out << "[" << log_type << "] "
#define REPORT_TIME "[" << boost::posix_time::second_clock::local_time() << "] "
#define REPORT_FILE_LINE "[" << __FILE__ << ":" << __LINE__ << "] "

#if defined(_DEBUG)
#define LOG_DEBUG REPORT_LOG_TYPE(*g_log_file, "DEBUG") << REPORT_TIME << REPORT_FILE_LINE
#else
static boost::iostreams::stream<boost::iostreams::null_sink> g_null_out(boost::iostreams::null_sink{});
#define LOG_DEBUG g_null_out
#endif

#define LOG_INFO REPORT_LOG_TYPE(*g_log_file, "INFO") << REPORT_TIME << REPORT_FILE_LINE
#define LOG_WARNING REPORT_LOG_TYPE(*g_log_file, "WARNING") << REPORT_TIME << REPORT_FILE_LINE
#define LOG_ERROR REPORT_LOG_TYPE(*g_log_file, "ERROR") << REPORT_TIME << REPORT_FILE_LINE
#define LOG_FATAL REPORT_LOG_TYPE(*g_log_file, "FATAL") << REPORT_TIME << REPORT_FILE_LINE

inline void onQuitImpl()
{
    if (g_log_file)
    {
        LOG_INFO << "Server is shutting down..." << std::endl;
        g_log_file->flush();
        g_log_file->close();
        delete g_log_file;
        g_log_file = nullptr;
    }
}

struct LogFileHolder
{
    ~LogFileHolder()
    {
        onQuitImpl();
    }
};

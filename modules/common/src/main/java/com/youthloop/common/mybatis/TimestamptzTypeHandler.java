package com.youthloop.common.mybatis;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.*;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * PostgreSQL TIMESTAMPTZ 到 LocalDateTime 的类型处理器
 * 
 * PostgreSQL 的 TIMESTAMPTZ 类型存储带时区的时间戳，
 * 但应用层使用 LocalDateTime（不带时区）。
 * 此处理器负责在两者之间进行转换。
 */
@MappedTypes(LocalDateTime.class)
public class TimestamptzTypeHandler extends BaseTypeHandler<LocalDateTime> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, LocalDateTime parameter, JdbcType jdbcType) throws SQLException {
        // 将 LocalDateTime 转换为 Timestamp 写入数据库
        ps.setTimestamp(i, Timestamp.valueOf(parameter));
    }

    @Override
    public LocalDateTime getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return toLocalDateTime(rs.getObject(columnName));
    }

    @Override
    public LocalDateTime getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return toLocalDateTime(rs.getObject(columnIndex));
    }

    @Override
    public LocalDateTime getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return toLocalDateTime(cs.getObject(columnIndex));
    }

    /**
     * 将数据库返回的对象转换为 LocalDateTime
     */
    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) {
            return null;
        }
        
        // PostgreSQL JDBC 驱动返回 OffsetDateTime
        if (value instanceof OffsetDateTime) {
            return ((OffsetDateTime) value).toLocalDateTime();
        }
        
        // 兼容 Timestamp 类型
        if (value instanceof Timestamp) {
            return ((Timestamp) value).toLocalDateTime();
        }
        
        throw new IllegalArgumentException("无法将 " + value.getClass() + " 转换为 LocalDateTime");
    }
}

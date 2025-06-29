import os
import csv
import pymysql

def import_csv_to_mysql(root_dir, db_config):
    """
    遍历指定目录下的所有CSV文件，并将其内容导入MySQL数据库。
    """
    conn = None
    try:
        conn = pymysql.connect(**db_config)
        cursor = conn.cursor()

        sql = """
        INSERT INTO water_quality_data (
            province, river_basin, section_name, monitoring_time, water_quality_category,
            temperature, ph, dissolved_oxygen, conductivity, turbidity,
            permanganate_index, ammonia_nitrogen, total_phosphorus, total_nitrogen,
            chlorophyll_a, algae_density, site_status
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        """

        for dirpath, _, filenames in os.walk(root_dir):
            for filename in filenames:
                if filename.endswith('.csv'):
                    filepath = os.path.join(dirpath, filename)
                    print(f"正在处理文件: {filepath}")
                    with open(filepath, 'r', encoding='utf-8') as f:
                        reader = csv.reader(f)
                        # 跳过CSV文件的标题行
                        try:
                            header = next(reader)
                            print(f"CSV文件标题行: {header}")
                        except StopIteration:
                            print(f"警告: 文件 {filepath} 为空，跳过。")
                            continue

                        for i, row in enumerate(reader):
                            if not row:
                                continue
                            
                            # 确保行数据与数据库字段数量匹配 (期望17列)
                            if len(row) != 17:
                                print(f"警告: 文件 {filepath} 中第 {i+2} 行数据列数不匹配 (期望17列，实际{len(row)}列)，跳过。行内容: {row}")
                                continue

                            try:
                                processed_row = []
                                for j, value in enumerate(row):
                                    # 数值字段索引
                                    numeric_indices = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
                                    if j in numeric_indices:
                                        if value == '*' or value == '':
                                            processed_row.append(None)
                                        else:
                                            try:
                                                processed_row.append(float(value))
                                            except ValueError:
                                                print(f"警告: 无法转换 '{value}' 为浮动数，设置为NULL")
                                                processed_row.append(None)
                                    else:
                                        processed_row.append(value if value else None)

                                cursor.execute(sql, tuple(processed_row))
                            except Exception as e:
                                print(f"插入数据时发生错误: {e}")
                                continue
                        conn.commit()
                    print(f"文件 {filepath} 处理完成。")
        print("所有CSV文件导入完成。")
    except pymysql.Error as e:
        print(f"数据库错误: {e}")
        if conn:
            conn.rollback()
    except Exception as e: 
        print(f"发生其他错误: {e}")
    finally:
        if conn:
            conn.close()

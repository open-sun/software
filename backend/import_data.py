import os
import csv
import pymysql

def import_csv_to_mysql(root_dir, db_config):
    """
    遍历指定目录下的所有CSV文件，并将其内容导入MySQL数据库。

    Args:
        root_dir (str): 包含CSV文件的根目录。
        db_config (dict): 数据库连接配置，包含host, user, password, db, charset。
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
                                    # 定义需要转换为数值的字段索引 (基于0开始的索引)
                                    # 水温(℃), pH(无量纲), 溶解氧(mg/L), 电导率(μS/cm), 浊度(NTU),
                                    # 高锰酸盐指数(mg/L), 氨氮(mg/L), 总磷(mg/L), 总氮(mg/L),
                                    # 叶绿素α(mg/L), 藻密度(cells/L)
                                    numeric_indices = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

                                    if j in numeric_indices:
                                        # 如果值是 '*' 或空字符串，则设置为 None (对应数据库中的 NULL)
                                        if value == '*' or value == '':
                                            processed_row.append(None)
                                        else:
                                            # 尝试转换为浮点数，如果失败则设置为 None
                                            try:
                                                processed_row.append(float(value))
                                            except ValueError:
                                                print(f"警告: 文件 {filepath} 中第 {i+2} 行，字段 '{header[j]}' 无法转换为数值: '{value}'，设置为NULL。")
                                                processed_row.append(None)
                                    else:
                                        # 其他字段（字符串），如果为空字符串也设置为 None
                                        processed_row.append(value if value else None)

                                cursor.execute(sql, tuple(processed_row))
                            except Exception as e:
                                print(f"插入数据时发生错误在文件 {filepath} 第 {i+2} 行: {e}. 行内容: {row}")
                                # 可以选择在此处跳过当前行或者记录错误
                                # conn.rollback() # 如果希望遇到错误就回滚整个CSV文件，可以在这里加上
                                continue # 跳过当前错误行，继续处理下一行
                        conn.commit() # 每个CSV文件处理完后提交一次事务
                    print(f"文件 {filepath} 处理完成。")
        print("所有CSV文件导入完成。")

    except pymysql.Error as e:
        print(f"数据库错误: {e}")
        if conn:
            conn.rollback() # 出现错误时回滚事务
    except Exception as e:
        print(f"发生其他错误: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    # 配置你的CSV文件根目录
    CSV_ROOT_DIRECTORY = '/root/software/backend/data/WaterQualitybyDate' # 替换为你实际的根目录

    # 配置你的MySQL数据库连接信息
    DB_CONFIG = {
        'host': 'localhost',
        'user': 'root',     # 替换为你的MySQL用户名
        'password': '123456', # 替换为你的MySQL密码
        'db': 'flask',    # 替换为你要使用的数据库名
        'charset': 'utf8mb4'
    }

    import_csv_to_mysql(CSV_ROOT_DIRECTORY, DB_CONFIG)
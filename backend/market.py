from flask import Blueprint, request, jsonify
import requests
from datetime import datetime, timedelta
import time

market_bp = Blueprint("market", __name__)

@market_bp.route('/api/market/prices', methods=['POST'])
def get_market_prices():
    try:
        # 从请求中获取日期参数，如果没有提供则使用前一天日期
        data = request.get_json()
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        product_name = data.get('productName', '')
        
        if not start_date:
            # 默认使用前一天作为查询日期，而不是当前日期
            from datetime import datetime, timedelta
            yesterday = datetime.now() - timedelta(days=3)
            start_date = yesterday.strftime("%Y/%m/%d")
            print(f"未提供日期，使用前一天日期: {start_date}")
        
        # 创建会话对象
        session = requests.Session()
        
        # 首先GET一次主页，获取防爬Cookie
        init_url = "http://www.xinfadi.com.cn/marketanalysis.html"
        init_response = session.get(
            init_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9"
            }
        )
        
        print(f"初始请求状态码: {init_response.status_code}")
        print(f"获取到的Cookies: {session.cookies.get_dict()}")
        
        # 2. 准备接口URL、表单数据和请求头
        url = 'http://www.xinfadi.com.cn/getPriceData.html'
        
        # 使用固定的参数，严格按照示例
        payload = {
            "limit": "100",          # 增加到100条
            "current": "1",
            "pubDateStartTime": start_date,
            "pubDateEndTime": end_date if end_date else "", # 如果提供了结束日期则使用
            "prodPcatid": "1190",    # 这里是水产类别
            "prodCatid": "",         # 这里传空串，不要用"0"
            "prodName": product_name # 支持按产品名称筛选
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "http://www.xinfadi.com.cn",
            "Referer": init_url,
            "X-Requested-With": "XMLHttpRequest",
        }
        
        # 3. 使用同一个会话发送POST请求
        response = session.post(url, data=payload, headers=headers)
        
        print(f"API请求状态码: {response.status_code}")
        print(f"查询参数: {payload}")
        print(f"最终Cookies状态: {session.cookies.get_dict()}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                items_count = len(result.get('list', []))
                print(f"成功获取市场数据: {items_count}条")
                return jsonify(result)
            except ValueError as e:
                error_msg = f"解析JSON响应失败: {str(e)}"
                print(error_msg)
                print(f"原始响应内容: {response.text[:200]}")
                return jsonify({'error': error_msg}), 500
        else:
            error_msg = f"获取市场数据失败: {response.status_code}, {response.text}"
            print(error_msg)
            return jsonify({'error': error_msg}), response.status_code
            
    except Exception as e:
        error_msg = f"市场API错误: {str(e)}"
        print(error_msg)
        return jsonify({'error': error_msg}), 500

@market_bp.route('/api/market/trends', methods=['POST'])
def get_market_trends():
    try:
        data = request.get_json()
        product_name = data.get('productName')
        spec_info = data.get('specInfo', '')  # 规格信息
        days = int(data.get('days', 7))  # 获取天数，默认7天
        
        if not product_name:
            return jsonify({'error': '产品名称不能为空'}), 400
            
        # 计算日期范围
        from datetime import datetime, timedelta
        today = datetime.now()
        
        # 同比数据：去年同期
        last_year = datetime(today.year-1, today.month, today.day)
        last_year_date = last_year.strftime("%Y/%m/%d")
        
        # 最近几天数据
        dates = []
        results = []
        
        for i in range(days):
            date = today - timedelta(days=i)
            formatted_date = date.strftime("%Y/%m/%d")
            dates.append(formatted_date)
            
            # 创建会话并获取某一天的数据
            session = requests.Session()
            init_url = "http://www.xinfadi.com.cn/marketanalysis.html"
            session.get(
                init_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "zh-CN,zh;q=0.9"
                }
            )
            
            # 查询特定日期的数据
            url = 'http://www.xinfadi.com.cn/getPriceData.html'
            payload = {
                "limit": "100",
                "current": "1",
                "pubDateStartTime": formatted_date,
                "pubDateEndTime": formatted_date,
                "prodPcatid": "1190",
                "prodCatid": "",
                "prodName": product_name
            }
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Accept-Language": "zh-CN,zh;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Origin": "http://www.xinfadi.com.cn",
                "Referer": init_url,
                "X-Requested-With": "XMLHttpRequest",
            }
            
            response = session.post(url, data=payload, headers=headers)
            
            if response.status_code == 200:
                try:
                    day_result = response.json()
                    # 过滤符合规格的数据
                    filtered_list = day_result.get('list', [])
                    if spec_info:
                        filtered_list = [item for item in filtered_list if item.get('specInfo') == spec_info]
                    
                    # 添加日期和数据到结果
                    daily_data = {
                        'date': formatted_date,
                        'items': filtered_list
                    }
                    results.append(daily_data)
                except Exception as e:
                    print(f"处理{formatted_date}数据出错: {str(e)}")
            
            # 休眠一小段时间，避免频繁请求
            import time
            time.sleep(0.5)
        
        # 获取去年同期数据
        try:
            session = requests.Session()
            session.get(init_url, headers=headers)
            
            last_year_payload = {
                "limit": "100",
                "current": "1",
                "pubDateStartTime": last_year_date,
                "pubDateEndTime": last_year_date,
                "prodPcatid": "1190",
                "prodCatid": "",
                "prodName": product_name
            }
            
            response = session.post(url, data=last_year_payload, headers=headers)
            
            last_year_data = None
            if response.status_code == 200:
                try:
                    last_year_result = response.json()
                    filtered_list = last_year_result.get('list', [])
                    if spec_info:
                        filtered_list = [item for item in filtered_list if item.get('specInfo') == spec_info]
                    
                    last_year_data = {
                        'date': last_year_date,
                        'items': filtered_list
                    }
                except Exception as e:
                    print(f"处理去年同期数据出错: {str(e)}")
        except Exception as e:
            print(f"获取去年同期数据出错: {str(e)}")
            last_year_data = None
        
        # 返回所有结果
        return jsonify({
            'product': product_name,
            'specInfo': spec_info,
            'current': results,
            'lastYear': last_year_data
        })
            
    except Exception as e:
        error_msg = f"获取价格趋势失败: {str(e)}"
        print(error_msg)
        return jsonify({'error': error_msg}), 500
    

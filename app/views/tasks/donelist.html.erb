<%= javascript_include_tag 'donelist' %>
<div class="container-fluid">
  <div class="donenote">
    <div class="row-fluid">
      <div class="span4">
        <ul class="nav nav-tabs nav-stacked">
          <% @month_list.each do |l| %>
            <li><%= link_to raw("#{l[:date].strftime("%Y-%m")} (#{l[:count]}) <i class='icon-chevron-right'></i>") , :year => l[:date].year ,:month => l[:date].mon  %></li>
          <% end %>
        </ul>
        <div id="done_chart"></div>
      </div>

      <div class="span8">
        <%= will_paginate(@tasks) %>
        <table id="done_list_table" class="table table-striped table-bordered">
          <% latest_day = nil %>
          <% @tasks.each do |task| %>
            <% current_day = task.updated_at.strftime("%Y-%m-%d") %>
            <tr>
              <% if latest_day == nil or latest_day != current_day %>
                <% latest_day = current_day %>
                <td class="done-list-day"><span class="label label-info"><%= current_day %></span></td>
                <td class="done-list-time"><span class="label"><%= task.updated_at.strftime("%2H:%2S") %></span></td>
                <td id="done_<%= task.id %>"></td>
              <% else %>
                <td></td>
                <td><span class="label"><%= task.updated_at.strftime("%2H:%2S") %></span></td>
                <td id="done_<%= task.id %>"></td>
              <% end %>
              <script>
                var msg_array = <%= to_js_array(task.msg) %>;
                $("#done_<%= task.id %>").html(taskAction.display_filter(msg_array.join('\n')));
              </script>
            </tr>
          <% end %>
        </table>
        <%= will_paginate(@tasks) %>
      </div>
    </div>
  </div>
</div>

<script>
$(document).ready(function() {
    // Radialize the colors
    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function(color) {
      return {
        radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
        stops: [
        [0, color],
        [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
        ]
      };
    });

    var chart_done = new Highcharts.Chart({
      chart: {
        renderTo: 'done_chart',
        type: 'column'
      },
      title: {
        text: 'Done Tasks'
      },
      xAxis: {
        categories: [
        <% @month_done_list.each do |m| %>
          '<%= m[:date].strftime("%m") %>',
        <% end %>
        ]
      },
      yAxis: {
        title: {
          text: 'Done'
        }
      },
      series: [
      { name: 'Done',
        data: [
        <% @month_done_list.each do |m| %>
          { name: 'done', y: <%= m[:count] %> },
        <% end %>
        ],
      }]
    });
  });
</script>
